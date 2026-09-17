# Team 1 — TLE

**Members:** Raj, Kunal
**Branch:** `team1-tle`
**Main technical work:** 1NF, 2NF, 3NF, 4NF visualizer
**Extra responsibilities:** Learn section, references, educational content

---

## Your area

```
frontend/src/features/learn/                 normal-form-content.ts, references.ts
frontend/src/features/first-to-third-nf/     new — your 1NF–3NF visualizers
frontend/src/features/four-nf/               FourNfPanel.tsx
frontend/src/pages/LearnPage.tsx
backend/src/normalization/engines/higher-nf.engine.4nf.spec.ts   new — your spec
```

Everything else is someone else's. `frontend/src/features/normalization/` is shared with Teams 2
and 3 — **announce before editing it.**

## Getting started

```bash
git checkout team1-tle
git pull
npm install
npm run dev
```

Then read, in this order:

1. [ARCHITECTURE.md](../ARCHITECTURE.md) — how the pieces fit
2. [API.md](../API.md) — the response shape you are rendering
3. `frontend/src/features/normalization/AnalysisResults.tsx` — where your views plug in
4. `frontend/src/features/normalization/NormalFormStrip.tsx` — the verdict strip you are extending

## What is already in place

- The backend computes 1NF, 2NF, 3NF, 4NF verdicts and their violations. **You do not need to
  compute anything.** Render what the API returns.
- `normal-form-content.ts` is seeded with all six normal forms, each with a definition, plain-English
  restatement, violation, fix, before/after example, and common mistakes.
- The Learn page renders that array, with anchors and a jump nav.
- `FourNfPanel.tsx` renders the 4NF verdict, the violations, and the `4NF_`-prefixed decomposition.

## What is missing — your job

| # | Owner | Deliverable |
| --- | --- | --- |
| R1 | Raj | 1NF visualizer — a repeating group and the relation it becomes |
| R2 | Raj | 2NF visualizer — highlight the proper subset of the key causing the partial dependency |
| R3 | Raj | Deepen the 1NF and 2NF Learn entries; add a third worked example each |
| R4 | Raj | Tests for your components and helpers |
| K1 | Kunal | 3NF visualizer — draw the transitive chain `key → X → Y` |
| K2 | Kunal | 4NF visualizer — the two independent facts, and why the cross-product is redundant |
| K3 | Kunal | **References list** — Codd, Boyce–Codd, Fagin, Maier, and a current textbook |
| K4 | Kunal | Deepen the 3NF, BCNF, 4NF, 5NF Learn entries; add a lossless-decomposition section |
| K5 | Kunal | `higher-nf.engine.4nf.spec.ts` — 4NF engine tests in your own file |

Both: a compare-and-contrast table of all six forms, and the nesting diagram
`5NF ⟹ 4NF ⟹ BCNF ⟹ 3NF ⟹ 2NF ⟹ 1NF`.

## The two ideas your visualizer must land

**2NF — which key, which subset.** A relation can have several candidate keys. A partial
dependency against *any* of them is a violation. Showing "the key" is not enough; show which key,
and which proper subset of it, is doing the damage.

**3NF vs BCNF — the prime attribute escape hatch.** 3NF tolerates `X -> A` when `A` is prime;
BCNF does not. The `Offering(Student, Course, Instructor)` example is the canonical case: both
`{Student, Course}` and `{Student, Instructor}` are keys, every attribute is prime, 3NF holds, and
BCNF fails. Draw it.

## Patterns to follow

Extend `normal-form-content.ts` rather than hard-coding prose into the page — Team 3's report
generator reads the same array.

Reuse the existing components rather than writing new ones:

```tsx
import { RelationTable } from '../normalization/RelationTable';
import { ViolationList } from '../normalization/ViolationList';
import { SCHEMA_EXAMPLES } from '../normalization/schema-examples';
```

Use the design-system class names (`card-padded`, `chip-brand`, `badge-fail`, `notice-error`, …)
from `frontend/src/index.css`. They already handle dark mode.

## Reading the API

```ts
// 1NF–3NF live in normalForms; 4NF/5NF live in higherNormalForms
response.normalForms['2NF'];
response.higherNormalForms.normalForms['4NF'];

// each violation names the dependency that caused it
response.violations.find((v) => v.normalForm === '2NF');

// 4NF decomposition relations are prefixed
response.higherNormalForms.decomposition.filter((r) => r.name.startsWith('4NF_'));
```

Use `orderedVerdicts(response)` from `types/normalization.ts` for one ordered list of all six.

## Definition of done

- [ ] A user can click any of 1NF–4NF and see *why* it holds or fails, with the offending dependency highlighted
- [ ] All six forms have complete Learn content with worked examples
- [ ] A cited references list renders on the Learn page
- [ ] `higher-nf.engine.4nf.spec.ts` covers: a trivial MVD, a complement, a superkey determinant, and no MVDs at all
- [ ] `npm run lint && npm test && npm run build` all pass
- [ ] Nothing outside your area changed without announcing it

## Full brief

[docs/TEAM-1-AND-TEAM-3-BRIEF.md](../TEAM-1-AND-TEAM-3-BRIEF.md) section 8.
