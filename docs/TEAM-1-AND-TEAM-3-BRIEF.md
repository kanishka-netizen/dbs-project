# DBS Project — Brief for Team 1 and Team 3

**Project:** Database Normalization Visualizer & Assistant
**Repository:** https://github.com/kanishka-netizen/dbs-project
**Audience:** Team 1 — TLE (Raj, Kunal) and Team 3 — Automatic Normalization (Kanishka)
**Written by:** Team 2 — TripleX

---

## 1. What we are building

A web app that takes a relational schema — a relation, its attributes, and its dependencies — and:

1. Reports which normal form it satisfies, from **1NF through 5NF**.
2. Names the specific dependency that breaks the weakest form it fails.
3. Shows the **decomposition** into smaller relations, step by step.
4. Explains each normal form with worked examples.
5. Normalises a schema automatically and exports a report.

### Who owns what

| Subteam | Members | Main technical work | Extra / common responsibilities |
| --- | --- | --- | --- |
| **Team 1 — TLE** | Raj, Kunal | 1NF, 2NF, 3NF, 4NF visualizer | Learn section, references, educational content |
| **Team 2 — TripleX** | Shreyansh, Aryan, Akshit | BCNF, 5NF + BCNF decomposition visualizer | UI/UX, navigation, help, day/night mode |
| **Team 3 — Automatic Normalization** | Kanishka | Automatic Normalization Assistant | Download / report generation, AI prompt log, overall integration |

---

## 2. The stack — and why

| Layer | Technology | Why |
| --- | --- | --- |
| Backend | **NestJS 12 + TypeScript 6**, ESM | Already built. All normalization logic lives here. |
| Frontend | **React 19 + Vite 8 + TypeScript 7** | Fast dev server, type-safe, easy SVG visualisation. |
| Styling | **Tailwind CSS 4** | Utility classes; the design system is already in `index.css`. |
| Routing | **React Router 7** | The route table already exists in `src/App.tsx`. |
| Tests | **Vitest 4** both sides | One runner for the whole repo. |
| Lint/format | **oxlint + Prettier** | `npm run lint` and `npm run format` at the root. |

**Do not add a new framework or a heavy dependency** (charting library, state manager, UI kit) without agreeing with the other teams first. Everything needed is already installed.

---

## 3. Getting the project running

Requires **Node.js >= 20.19**.

```bash
git clone https://github.com/kanishka-netizen/dbs-project.git
cd dbs-project
git checkout <your team branch>      # see section 5
npm install                          # installs backend + frontend together
npm run dev                          # backend :3001 and frontend :3000
```

Open <http://localhost:3000>.

### Useful commands

```bash
npm run dev               # both servers together
npm run dev:frontend      # just the React app, :3000
npm run dev:backend       # just the NestJS API, :3001
npm test                  # both test suites
npm run test:frontend
npm run test:backend
npm run lint              # both workspaces
npm run format            # both workspaces
npm run build             # production build of both
```

Run a single test file while working:

```bash
npm run test:frontend -- src/features/learn/references.test.ts
npm run test:backend  -- src/normalization/engines/nf.engine.spec.ts
```

---

## 4. How the code is organised

```
dbs-project/
├── backend/
│   └── src/normalization/
│       ├── dto/analyze-normalization.dto.ts    the request contract
│       ├── engines/                            one engine per normal form
│       │   ├── candidate-key.engine.ts         closure + candidate keys
│       │   ├── nf.engine.ts                    1NF, 2NF, 3NF, BCNF verdicts
│       │   ├── decomposition.engine.ts         2NF and 3NF decomposition
│       │   ├── bcnf.engine.ts                  BCNF decomposition
│       │   ├── mvd.engine.ts                   multivalued dependency + chase
│       │   ├── higher-nf.engine.ts             4NF and 5NF analysis
│       │   ├── steps.engine.ts                 the numbered walkthrough
│       │   └── validation.engine.ts            input validation
│       ├── normalization.controller.ts         POST /normalization/analyze
│       └── normalization.service.ts            the pipeline that runs them
│
├── frontend/
│   └── src/
│       ├── components/layout/                  app shell, navbar, theme
│       ├── features/
│       │   ├── normalization/                  shared: input form, results, parser
│       │   ├── learn/                          TEAM 1 — Learn content
│       │   ├── four-nf/                        TEAM 1 — 4NF panel
│       │   ├── bcnf/                           TEAM 2 — BCNF + 5NF panels
│       │   └── assistant/                      TEAM 3 — assistant + reports
│       ├── lib/api.ts                          the API client
│       ├── lib/download.ts                     file download helper
│       ├── pages/                              one file per route
│       └── types/normalization.ts              mirror of the API contract
│
└── docs/                                       architecture, API, branching
```

### The one rule about folders

**Work inside your own feature folder.** Editing another team's files is what creates the merge conflicts this branch model exists to prevent.

If you need a change in a **shared file** — `frontend/src/features/normalization/`, `frontend/src/components/layout/`, `backend/src/normalization/normalization.service.ts`, `frontend/src/types/normalization.ts` — post in the team channel first.

---

## 5. Branching and how to get your work merged

| Branch | Purpose |
| --- | --- |
| `main` | Integration only. **Never commit directly.** |
| `team1-tle` | Team 1's integration branch |
| `team2-triplex` | Team 2's integration branch |
| `team3-automatic-normalization` | Team 3's integration branch |
| `feat/<team>-<what>` | One piece of work |
| `fix/<team>-<what>` | One bug fix |

### Your workflow

```bash
# start from your team branch, never from main
git checkout team1-tle
git pull
git checkout -b feat/team1-references-list

# ...make the change...

npm run lint && npm test && npm run build   # all three must pass

git add -A
git commit -m "feat(team1): add the references list to the Learn page"
git push -u origin feat/team1-references-list
```

Then open a **pull request into your own team branch**. One teammate reviews it. Your team lead merges the team branch into `main` at the integration checkpoints (section 10).

### Commit message format

```
feat(team1): add a references list to the Learn page
fix(team3): keep the report download from re-firing
docs(team3): describe the report JSON shape
test(team1): cover 4NF on the supplier-part-project example
```

---

## 6. The API — this is what your UI talks to

**One endpoint.** Backend on `:3001`, and Vite proxies `/api` to it, so the browser can just call `/api/normalization/analyze` with no CORS handling.

### Request

`POST /api/normalization/analyze`

```json
{
  "relationName": "Supply",
  "attributes": ["Supplier", "Part", "Project"],
  "functionalDependencies": [
    { "left": ["StudentID", "CourseID"], "right": ["CourseName"] }
  ],
  "multivaluedDependencies": [
    { "left": ["Supplier"], "right": ["Part"] }
  ]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `relationName` | yes | Display name only |
| `attributes` | yes | Every attribute in the relation |
| `functionalDependencies` | yes | `left -> right`; both sides are arrays |
| `multivaluedDependencies` | no | `left ->> right`. **Required for 4NF and 5NF** |
| `joinDependencies` | no | `{ "relations": [["A","B"],["B","C"]] }` |

### Response — valid schema

```json
{
  "relation": "Supply",
  "valid": true,
  "attributes": ["Supplier", "Part", "Project"],
  "functionalDependencies": [],
  "multivaluedDependencies": [{ "left": ["Supplier"], "right": ["Part"] }],

  "candidateKeys": [["Supplier", "Part", "Project"]],

  "normalForms": { "1NF": true, "2NF": true, "3NF": true, "BCNF": true },
  "highestNormalForm": "BCNF",

  "violations": [
    { "normalForm": "2NF", "dependency": "A -> B", "reason": "..." }
  ],

  "decomposition": [
    { "name": "R_1", "attributes": ["A", "B"], "reason": "..." }
  ],

  "bcnfDecomposition": [
    { "name": "BCNF_R1", "attributes": ["A", "B", "C"], "reason": "..." }
  ],

  "higherNormalForms": {
    "normalForms": { "4NF": false, "5NF": false },
    "highestNormalForm": null,
    "violations": [
      { "normalForm": "4NF", "dependency": "Supplier ->> Part", "reason": "..." },
      { "normalForm": "5NF", "dependency": "(Supplier, Part) ⨝ (Supplier, Project) ⨝ (Part, Project)", "reason": "..." }
    ],
    "decomposition": [
      { "name": "4NF_R1", "attributes": ["Supplier", "Part"], "reason": "..." },
      { "name": "5NF_R1", "attributes": ["Supplier", "Part"], "reason": "..." }
    ]
  },

  "steps": [
    { "step": 1, "title": "Find Candidate Keys", "description": "...", "result": "..." }
  ],

  "warnings": []
}
```

### Response — invalid schema

The backend answers **`200`**, not `4xx`:

```json
{
  "relation": "R",
  "valid": false,
  "errors": ["Functional dependency 1 contains unknown attribute(s): Z"],
  "warnings": []
}
```

### Things that will trip you up

- **An invalid schema is not an HTTP error.** Check `valid` before you read anything else.
- **Normal form verdicts are split across two objects.** `normalForms` has `1NF`/`2NF`/`3NF`/`BCNF`; `higherNormalForms.normalForms` has `4NF`/`5NF`. Use the helper `orderedVerdicts()` in `frontend/src/types/normalization.ts` to get one ordered list.
- **Decomposition names are prefixed by the form that produced them.** Filter with `name.startsWith('4NF_')` or `'5NF_'` so each panel shows its own.
- **`highestNormalForm` can be `"BCNF"` while 4NF and 5NF both fail.** That is correct: the relation reaches BCNF but not 4NF. Only `higherNormalForms.highestNormalForm` is `"4NF"`/`"5NF"`/`null`.
- **MVDs need `->>`, not `->`.** Without them the 4NF and 5NF rows always show "Satisfied", because no multivalued dependency was declared.
- **`A, B ->> C` is often trivial.** If `X ∪ Y` covers the whole relation the dependency constrains nothing and is skipped.

---

## 7. What already exists — do not rebuild it

**Team 2 has already delivered:**

| Thing | Where |
| --- | --- |
| The whole NestJS pipeline | `backend/src/normalization/normalization.service.ts` |
| 1NF / 2NF / 3NF / BCNF verdict engine | `backend/src/normalization/engines/nf.engine.ts` |
| 2NF and 3NF decomposition | `backend/src/normalization/engines/decomposition.engine.ts` |
| BCNF decomposition | `backend/src/normalization/engines/bcnf.engine.ts` |
| **Multivalued dependency engine + chase** | `backend/src/normalization/engines/mvd.engine.ts` |
| **4NF and 5NF analysis (working, not a stub)** | `backend/src/normalization/engines/higher-nf.engine.ts` |
| Step-by-step walkthrough, 1NF → 5NF | `backend/src/normalization/engines/steps.engine.ts` |
| Schema text parser (`A, B -> C`, `A ->> B`) | `frontend/src/features/normalization/schema-text.ts` |
| Input form with 5 example schemas | `frontend/src/features/normalization/SchemaInput.tsx` |
| Results shell, verdict strip, step timeline | `frontend/src/features/normalization/AnalysisResults.tsx` |
| API client | `frontend/src/lib/api.ts` |
| Dark / light theme + toggle | `frontend/src/theme/`, `frontend/src/components/layout/ThemeToggle.tsx` |
| Navigation shell + routing | `frontend/src/App.tsx`, `frontend/src/components/layout/` |
| File download helper | `frontend/src/lib/download.ts` |

**Build on these. Do not write a second copy.**

### Reusable frontend components

```tsx
import { RelationTable } from '../normalization/RelationTable';
// renders a relation as a card: name, attribute chips, a reason line

import { ViolationList } from '../normalization/ViolationList';
// renders violations; takes `emptyMessage`

import { StepsTimeline } from '../normalization/StepsTimeline';
// renders the numbered walkthrough

import { NormalFormStrip } from '../normalization/NormalFormStrip';
// the 1NF → 5NF badge row

import { SCHEMA_EXAMPLES } from '../normalization/schema-examples';
// the example schemas, reused on the Learn and Help pages
```

### The design system

Use these class names rather than writing raw Tailwind for common shapes — they already handle dark mode:

`card`, `card-padded`, `btn-primary`, `btn-secondary`, `btn-ghost`, `input`, `label`, `chip-neutral`, `chip-brand`, `badge-pass`, `badge-fail`, `badge-info`, `page-title`, `page-subtitle`, `section-title`, `notice-warn`, `notice-error`

They are defined in `frontend/src/index.css`.

### The schema text format

```
attributes: StudentID, CourseID, CourseName

StudentID, CourseID -> CourseName
CourseID ->> CourseName
```

- First line lists the attributes; a bare first line also works.
- `->` is a functional dependency, `->>` a multivalued dependency.
- `→` and `↠` are accepted too.
- `#`, `--` and `//` start a comment.

Parse it with `parseSchema(text)`, which returns `{ schema, issues }`.

---

## 8. TEAM 1 — TLE (Raj, Kunal)

### Your deliverables

| # | Deliverable | Where it goes |
| --- | --- | --- |
| 1.1 | **1NF / 2NF / 3NF / 4NF visualizer** — an interactive view that shows *why* each form holds or fails | `frontend/src/features/four-nf/` + a new folder for 1NF–3NF |
| 1.2 | **Learn section** — finished explanatory content for all six forms | `frontend/src/features/learn/normal-form-content.ts`, `frontend/src/pages/LearnPage.tsx` |
| 1.3 | **References** — a citations/references list | new file `frontend/src/features/learn/references.ts` + render it on the Learn page |
| 1.4 | **Educational content** — worked examples, diagrams, common mistakes | `frontend/src/features/learn/` |
| 1.5 | **4NF engine coverage** — tests for the 4NF branch | new file `backend/src/normalization/engines/higher-nf.engine.4nf.spec.ts` |

### 1.1 The visualizer — what "interactive" should mean

The results page already lists verdicts and prints the decomposition. Your job is to make it **explain itself**:

- Let the user click a normal form badge (1NF, 2NF, 3NF, 4NF) to expand the reason it passes or fails.
- Highlight the **offending dependency** in the schema the user typed — not just in a list.
- For 2NF, show *which part of the key* is being partially depended on.
- For 3NF, draw the transitive chain: `key → X → Y`.
- For 4NF, show the two independent sets of facts side by side, and why the cross-product is redundant.

A good starting point is a coloured SVG of the relation with the determinant attributes outlined. `RelationTable` and `ViolationList` give you the data; extend them or wrap them.

**Where:** create `frontend/src/features/first-to-third-nf/` for the 1NF–3NF views and extend `frontend/src/features/four-nf/FourNfPanel.tsx`. Leave `FourNfPanel`'s props (`higherNormalForms`) alone — it is wired into `AnalysisResults`.

Then wire your views into `frontend/src/features/normalization/AnalysisResults.tsx`. **Announce that edit first** — Team 2 owns that file.

### 1.2 and 1.4 The Learn content

`frontend/src/features/learn/normal-form-content.ts` is already seeded with all six normal forms. Each entry has:

```ts
{
  normalForm: '3NF',
  tagline: string,        // one-line summary
  definition: string,     // formal, exam-ready
  plainEnglish: string,   // restated simply
  violation: string,      // what breaks it
  fix: string,            // how to repair it
  example: { before, beforeProblem, after },
  commonMistakes: string[],
}
```

**Extend this array — do not hard-code prose into the page.** Team 3's report generator reads the same data.

Suggested additions:
- A third worked example per form, at increasing difficulty.
- A comparison table of the six forms (what it removes, what it allows).
- A "normal forms are nested" diagram: 5NF ⟹ 4NF ⟹ BCNF ⟹ 3NF ⟹ 2NF ⟹ 1NF.
- Lossless vs. dependency-preserving decomposition, which is currently absent.

### 1.3 References

Create `frontend/src/features/learn/references.ts`:

```ts
export interface Reference {
  id: string;
  authors: string;
  title: string;
  source: string;      // journal / book / site
  year: number;
  url?: string;
}
```

Cite the primary sources — Codd (1970, 1971), Boyce–Codd, Fagin (1977 for 4NF, 1979 for 5NF), Maier, and a current textbook treatment. Render them as an ordered list on the Learn page, and cite the specific reference next to the relevant normal form.

### 1.5 The 4NF engine tests

The 4NF logic is implemented in `backend/src/normalization/engines/higher-nf.engine.ts`. Read it, then write tests in **your own spec file** so you never conflict with Team 2's `higher-nf.engine.5nf.spec.ts`:

```ts
import { HigherNormalFormEngine } from './higher-nf.engine.js';

describe('HigherNormalFormEngine — 4NF', () => {
  it('fails 4NF when a non-superkey multivalues another attribute', () => {
    const result = HigherNormalFormEngine.analyze(
      ['Supplier', 'Part', 'Project'],
      [],
      [{ left: ['Supplier'], right: ['Part'] }],
    );

    expect(result.normalForms['4NF']).toBe(false);
    expect(result.decomposition.map((r) => r.attributes)).toContainEqual([
      'Supplier',
      'Part',
    ]);
  });
});
```

Cover at least: a trivial MVD, a complement (`Supplier ->> Project` must behave like `Supplier ->> Part`), an MVD whose left *is* a superkey, and a relation with no MVDs at all.

### Your definition of done

- [ ] A user can click any of 1NF–4NF and see the reason it holds or fails, with the offending dependency highlighted
- [ ] All six forms have complete Learn content with worked examples
- [ ] A references list exists, is cited, and renders on the Learn page
- [ ] `higher-nf.engine.4nf.spec.ts` passes and covers the four cases above
- [ ] `npm run lint && npm test && npm run build` all pass
- [ ] Nothing outside `frontend/src/features/learn/`, `frontend/src/features/four-nf/`, `frontend/src/features/first-to-third-nf/`, and your own spec file was changed without announcing it

---

## 9. TEAM 3 — Automatic Normalization (Kanishka)

You have the largest surface area and the integration role. Prioritise in this order.

### Your deliverables

| # | Deliverable | Where it goes |
| --- | --- | --- |
| 3.1 | **Automatic Normalization Assistant** — takes a schema, returns the normalised relations | `frontend/src/features/assistant/` |
| 3.2 | **Download / report generation** | new file `frontend/src/features/assistant/report.ts` |
| 3.3 | **AI prompt log** | new files `frontend/src/features/assistant/prompt-log.ts` + a component |
| 3.4 | **Overall integration** — keeping `main` green and the three team branches mergeable | repo-wide |
| 3.5 | **Assistant page polish** | `frontend/src/pages/AssistantPage.tsx` |

### 3.1 The assistant

A working first version already exists: `frontend/src/features/assistant/AssistantPanel.tsx`. It calls `resolveNormalizedSchema()` and renders the target relations.

`resolveNormalizedSchema` currently picks the deepest available decomposition:

1. `higherNormalForms.decomposition` if non-empty (4NF/5NF)
2. else `bcnfDecomposition`
3. else `decomposition` (2NF/3NF)
4. else the relation unchanged

**What is missing and is yours to build:**

- **A step-by-step normalisation path.** Right now the user sees only the destination. Show the journey: *this relation is in 1NF → here is the 2NF fix → here is the 3NF fix → …*. `steps` in the response has the narrative; use it to drive a stepper UI.
- **Explain whether the decomposition is lossless and dependency-preserving.** Neither is currently computed or displayed. Losslessness can be checked with `MvdEngine.isLossless()` on the backend — talk to Team 2 before adding an endpoint.
- **Let the user edit and re-run.** The assistant should feel like a workspace, not a form submission.
- **Input beyond typed text.** Accept a `CREATE TABLE` paste, or CSV headers, and convert it to attributes + dependencies with the existing `parseSchema` contract.

### 3.2 Download and report generation

`frontend/src/lib/download.ts` has a working `downloadFile(filename, contents, mimeType)`. The assistant already exports JSON.

Build out `frontend/src/features/assistant/report.ts` as a pure module — no React — so it is testable:

```ts
export interface NormalizationReport {
  generatedAt: string;
  relation: string;
  originalAttributes: string[];
  functionalDependencies: FunctionalDependency[];
  multivaluedDependencies: MultivaluedDependency[];
  candidateKeys: string[][];
  normalForms: Record<string, boolean>;
  highestNormalForm: string;
  violations: NormalizationViolation[];
  normalizedSchema: DecomposedRelation[];
  steps: NormalizationStep[];
}

export function buildReport(analysis: NormalizationAnalysis): NormalizationReport;
export function toMarkdown(report: NormalizationReport): string;
export function toJson(report: NormalizationReport): string;
```

Deliver:

- **JSON** export (already started in `AssistantPanel` — move the logic into `report.ts`).
- **Markdown** export — the most useful format for a report that a student submits.
- **PDF or print** export. The cheapest reliable route is Markdown → a print-styled page → the browser's `Ctrl+P`. Building a PDF in the browser needs a dependency; **get agreement before adding one**.

Cover the report module with tests — it is pure functions, so this is cheap:

```ts
import { describe, expect, it } from 'vitest';
import { buildReport, toMarkdown } from './report';
```

### 3.3 The AI prompt log

The assistant page has a placeholder panel for this. It should record **every prompt and response used during development**, alongside the explanation generated for each analysis.

Suggested shape:

```ts
export interface PromptLogEntry {
  id: string;
  timestamp: string;
  purpose: string;        // e.g. "Explain the 3NF violation"
  prompt: string;
  response: string;
  model?: string;
}
```

**Important:** if you call an AI service, the key must come from an environment variable (`VITE_...`) and must **never** be committed. Add the variable to a `.env.example` and keep the real `.env` out of git — it is already in `.gitignore`.

If you do not have API access, build the log as a documented, manually-maintained record of the prompts used while developing. That satisfies the deliverable honestly and is defensible in a viva.

### 3.4 Integration — your most valuable job

You are the integration owner. That means:

- **Watch `main` daily.** If it goes red, that is your priority.
- **Run `npm install && npm test && npm run build` after every merge** into `main`.
- **Resolve cross-team conflicts.** When Team 1 and Team 2 both touch `AnalysisResults.tsx`, you arbitrate.
- **Own the shared contract.** `frontend/src/types/normalization.ts` must always match `backend/src/normalization/dto/analyze-normalization.dto.ts` and `docs/API.md`. If they drift, fix it and tell both teams.
- **Keep `main` deployable.** Verify the production build, not just the dev server.

### Your definition of done

- [ ] The assistant shows the full normalisation path, not just the destination
- [ ] JSON **and** Markdown report export both work; the Markdown one is presentable as a submitted report
- [ ] `report.ts` is pure, exported, and covered by tests
- [ ] The AI prompt log records real entries and renders on the Assistant page
- [ ] No secret is committed; `.env.example` documents what is needed
- [ ] `main` builds, lints, and tests green after every team merge
- [ ] `docs/API.md` and `frontend/src/types/normalization.ts` match the backend

---

## 10. Integration checkpoints

Agree on dates for these, and treat them as hard:

| Checkpoint | What must be true |
| --- | --- |
| **1** | Every team has pushed at least one commit to its own branch. Everyone can run `npm run dev`. |
| **2** | Each team's feature works on its own branch. First merge of `team1-*` and `team3-*` into `main`. |
| **3** | All three merged. Full analysis works end to end for 1NF → 5NF. Reports export. |
| **4** | Freeze. Only bug fixes. Rehearse the demo. Verify the production build. |

### The merge ritual

Every time a team branch goes into `main`:

```bash
git checkout main
git pull
npm install          # dependencies may have changed
npm run lint
npm test
npm run build        # must pass — this is what CI would run
```

If it fails, **do not merge**. Fix on the team branch.

---

## 11. Conventions that will keep you out of trouble

### TypeScript

- **ESM on the backend** — relative imports need the `.js` extension, even from a `.ts` file:

```ts
import { CandidateKeyEngine } from './engines/candidate-key.engine.js';
```

- **No `any`.** Types live in `frontend/src/types/normalization.ts` and `backend/src/normalization/engines/`.
- The frontend uses `verbatimModuleSyntax`, so type-only imports must be marked:

```ts
import type { NormalizationAnalysis } from '../../types/normalization';
```

- `noUnusedLocals` and `noUnusedParameters` are on — an unused variable fails the build.

### Style

- **Match the surrounding code.** This repo is written in a consistent, heavily line-broken style. Prettier enforces the basics: `npm run format`.
- Comments explain **why**, not what. Do not add a comment to every line.

### Tests

Every engine or pure-module change needs a test. Vitest globals are enabled, so `describe`, `it` and `expect` need no import.

### Changing the API contract

If you must change it:

1. `backend/src/normalization/dto/analyze-normalization.dto.ts`
2. `frontend/src/types/normalization.ts`
3. `docs/API.md`
4. **Tell the other two teams.** It is a breaking change for them.

---

## 12. If something looks broken

| Symptom | Cause |
| --- | --- |
| "Could not reach the analysis service" | Backend not running. `npm run dev:backend`, or check port 3001. |
| 4NF and 5NF always show "Satisfied" | No multivalued dependencies were entered. Use `->>`. |
| A `->>` line is silently ignored | It is trivial: `X ∪ Y` covers the whole relation, so it constrains nothing. |
| `Cannot apply unknown utility class` | A Tailwind class was used that is not defined. Add it as `@utility` in `frontend/src/index.css`. |
| An empty test run passes with 0 tests | Vitest needs a file matching `**/*.spec.ts` (backend) or `src/**/*.{test,spec}.{ts,tsx}` (frontend). |

---

## 13. Ground rules

1. **Never commit directly to `main`.**
2. **Stay in your own folder.** Announce before touching a shared file.
3. **`npm run lint && npm test && npm run build` before every pull request.** No exceptions.
4. **No new dependency without team agreement.**
5. **No secrets in the repository.** Environment variables only, and add them to `.env.example`.
6. **Pull your team branch before you start working**, every session.
7. **Ask early.** A five-minute question beats a day of building the wrong thing.
