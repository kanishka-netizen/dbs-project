# Architecture

## Overview

One React client talks to one NestJS endpoint. All normalization logic lives on the server as a
set of small, pure, independently testable **engines**. The client is a rendering layer.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browser — React 19 + Vite                                           │
│                                                                      │
│   pages/            route-level views                                │
│   features/         one folder per team's feature area               │
│   lib/api.ts        the only place that calls fetch                  │
│                                                                      │
│   POST /api/normalization/analyze                                    │
└───────────────────────────────┬──────────────────────────────────────┘
                                │  Vite dev proxy  /api → :3001
┌───────────────────────────────▼──────────────────────────────────────┐
│  NestJS 12 — :3001                                                   │
│                                                                      │
│   NormalizationController   POST /normalization/analyze              │
│            │                                                         │
│            ▼                                                         │
│   NormalizationService      the pipeline                             │
│            │                                                         │
│            ├─ ValidationEngine      input sanity                     │
│            ├─ CandidateKeyEngine    closure + candidate keys         │
│            ├─ NormalFormEngine      1NF / 2NF / 3NF / BCNF           │
│            ├─ DecompositionEngine   2NF and 3NF synthesis            │
│            ├─ BCNFEngine            BCNF analysis algorithm          │
│            ├─ MvdEngine             MVD utilities + the chase        │
│            ├─ HigherNormalFormEngine 4NF and 5NF                     │
│            └─ StepsEngine           the narrative walkthrough        │
└──────────────────────────────────────────────────────────────────────┘
```

## Why the logic lives on the backend

Every normal form decision is a computation over the dependency set, not a presentation concern.
Keeping it server-side means:

- **One implementation.** The visualizer, the Learn page's worked examples, and Team 3's report
  generator all consume the same verdicts. If the UI disagreed with the report, the tool would be
  worse than useless in a viva.
- **Testability.** Engines are static classes with no framework coupling, so they are tested
  directly with Vitest, with no HTTP and no DOM.
- **The client stays thin.** React components render; they do not decide whether 3NF holds.

## The pipeline

`NormalizationService.analyze()` runs a fixed sequence. Each step feeds the next.

| # | Step | Engine | Output |
| --- | --- | --- | --- |
| 1 | Validate the request | `ValidationEngine` | `errors`, `warnings` — short-circuits on error |
| 2 | Find candidate keys | `CandidateKeyEngine` | every minimal superkey |
| 3 | Decide 1NF–BCNF | `NormalFormEngine` | four booleans + violations |
| 4 | Decompose toward 2NF or 3NF | `DecompositionEngine` | relations, only if violated |
| 5 | Decompose toward BCNF | `BCNFEngine` | relations |
| 6 | Decide 4NF and 5NF | `HigherNormalFormEngine` | verdicts + violations + decomposition |
| 7 | Build the walkthrough | `StepsEngine` | 8 numbered steps |

### Why 4NF/5NF is a separate pass

1NF through BCNF are decidable from functional dependencies alone. 4NF and 5NF are about
**multivalued dependencies** and **join dependencies**, which FDs cannot express. So they get
their own engine, their own input field (`multivaluedDependencies`), and their own verdict object
(`higherNormalForms`) rather than being folded into `normalForms`.

### The BCNF guard

`HigherNormalFormEngine` takes the BCNF verdict as a parameter. This matters: a relation with *no*
declared MVDs satisfies 4NF and 5NF **vacuously**. Without the guard, a relation failing BCNF
would be reported as being in 5NF. Since 4NF implies BCNF, a relation below BCNF is below 4NF too,
regardless of its MVDs.

Handling it in the engine rather than the service keeps the panel messages truthful — the 4NF
panel shows an explicit reason instead of an unexplained "Violated".

## The engines

| Engine | Responsibility | Owner |
| --- | --- | --- |
| `validation.engine.ts` | Reject unknown attributes, empty sides, duplicates; warn on trivial FDs | shared |
| `candidate-key.engine.ts` | Attribute closure; enumerate and minimise candidate keys | shared |
| `nf.engine.ts` | 1NF, 2NF, 3NF, BCNF verdicts and violations | Team 1 (1NF–3NF) / Team 2 (BCNF) |
| `decomposition.engine.ts` | 2NF (partial dependency) and 3NF (synthesis) decomposition | Team 1 |
| `bcnf.engine.ts` | BCNF analysis algorithm | Team 2 |
| `mvd.engine.ts` | MVD triviality, complementation, closure, and the chase | Team 2 |
| `higher-nf.engine.ts` | 4NF and 5NF verdicts, violations, decomposition | Team 2 (4NF branch extended by Team 1) |
| `steps.engine.ts` | The numbered walkthrough shown in the UI | shared |

### The chase

`MvdEngine.isLossless()` implements the **tableau chase**. It builds a row per relation, marking a
distinguished variable `a_j` where the relation covers attribute `j`, then repeatedly applies:

- **FD rule** — two rows agreeing on `X` must agree on `Y`, so their symbols on `Y` are merged.
  Distinguished symbols win.
- **MVD rule** — two rows agreeing on `X` imply a third row agreeing with the first on `X ∪ Y` and
  with the second outside `X ∪ Y`.

The decomposition is lossless when some row becomes distinguished in every column.

The chase is bounded (200 rows, 200 steps) so a pathological input cannot hang the request. This is
a deliberate trade-off: it is more than enough for teaching-sized schemas, and it fails safe.

### How 5NF is decided

A fully general 5NF decision needs join-dependency inference, which is not tractable in practice.
This implementation is explicit about what it does:

1. **Derive** candidate join dependencies from the MVD set. For `X ->> Y` with
   `Z = R - X - Y`, the three-way split is `{X ∪ Y, X ∪ Z, Y ∪ Z}`.
2. **Confirm** each candidate is lossless with the chase.
3. **Accept** explicit `joinDependencies` from the caller as asserted facts — they are trusted
   rather than re-derived.
4. **Reject** any candidate where a component is the whole relation, or where a component is
   already a superkey (meaning the candidate keys imply the join dependency, so it constrains
   nothing).

This is a well-defined subset of 5NF rather than a complete implementation, and it is documented as
such.

## The client

```
frontend/src/
├── main.tsx                    entry; mounts ThemeProvider
├── App.tsx                     route table
├── index.css                   the design system (@theme + @utility)
├── components/layout/          AppShell, Navbar, ThemeToggle, nav-items
├── features/
│   ├── normalization/          shared: SchemaInput, AnalysisResults, parser, API hook
│   ├── learn/                  TEAM 1 — Learn content
│   ├── four-nf/                TEAM 1 — 4NF panel
│   ├── bcnf/                   TEAM 2 — BCNF and 5NF panels
│   └── assistant/              TEAM 3 — assistant, reports
├── lib/                        api.ts, download.ts
├── pages/                      one file per route
├── theme/                      ThemeProvider, useTheme
└── types/normalization.ts      mirror of the API contract
```

### Ownership map

| Path | Team |
| --- | --- |
| `frontend/src/features/learn/**` | Team 1 |
| `frontend/src/features/four-nf/**` | Team 1 |
| `frontend/src/features/first-to-third-nf/**` | Team 1 |
| `frontend/src/features/bcnf/**` | Team 2 |
| `frontend/src/features/assistant/**` | Team 3 |
| `frontend/src/components/layout/**` | Team 2 |
| `frontend/src/theme/**` | Team 2 |
| `frontend/src/index.css` | Team 2 |
| `frontend/src/features/normalization/**` | shared — announce changes |
| `frontend/src/lib/**` | shared — announce changes |
| `frontend/src/types/normalization.ts` | shared — announce changes |
| `backend/src/normalization/engines/mvd.engine.ts` | Team 2 |
| `backend/src/normalization/engines/higher-nf.engine.ts` | Team 2 (4NF branch: Team 1) |
| `backend/src/normalization/normalization.service.ts` | shared — announce changes |
| `docs/`, root `README.md`, root `package.json` | shared — announce changes |

### The design system

Tailwind v4 with the design tokens in `@theme` and the reusable classes as `@utility` blocks in
`frontend/src/index.css`. `@utility` rather than `@layer components` is deliberate: Tailwind v4
only lets `@apply` reference real utilities, so a class defined in `@layer components` cannot be
composed into another.

Dark mode is **class-based** (`@custom-variant dark`), not media-query based, so the day/night
toggle can override the OS preference. An inline script in `index.html` applies the stored choice
before first paint, which is why there is no theme flash on load.

### Type mirroring, and why

`frontend/src/types/normalization.ts` duplicates the backend contract rather than importing it.
The backend is ESM with its own `rootDir`; a cross-workspace import would fight the `nest build`
tsconfig. The duplication is ~120 lines and is called out in a header comment in both files.

**If you change the contract, change it in three places:** the DTO, the mirror, and `docs/API.md`.

## A note on the frontend history

The `frontend/` directory was committed as a **broken git submodule pointer** — a gitlink (mode
`160000`) to commit `8777485` with no `.gitmodules` entry, pointing at an object that does not
exist in the repository. Cloning produced an empty folder that could not be populated.

Searching the full history confirms **no frontend source was ever committed** — the commit titled
"Connect normalization assistant frontend to backend" only ever touched backend files. The
frontend was therefore rebuilt from scratch and the broken gitlink removed.

## Known limitations

These are deliberate scope boundaries, not oversights. Each is a candidate for follow-up work.

- **1NF is assumed, not verified.** Attributes are taken to be atomic, because a JSON attribute
  list cannot express a repeating group. `NormalFormEngine` hard-codes `is1NF = true` and the
  Learn content says so explicitly.
- **5NF is partial.** See "How 5NF is decided" above.
- **Losslessness and dependency preservation are not reported.** `MvdEngine.isLossless()` exists
  and is used internally, but the result is not surfaced in the API response.
- **The chase has a row and step cap**, so an exceptionally large schema could report a
  decomposition as lossless when the chase did not converge.
- **Candidates are enumerated by bitmask**, so attribute closure is exponential in the number of
  attributes. Fine for teaching-sized schemas (≤ ~20 attributes), not for production schemas.
- **No persistence.** Every request is stateless; nothing is stored between analyses.
