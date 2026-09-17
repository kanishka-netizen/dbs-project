# Work division

Every deliverable mapped to a team and a person, with what is already in place and what remains.

**Branch per team:** `team1-tle`, `team2-triplex`, `team3-automatic-normalization`
**Workflow:** [BRANCHING.md](BRANCHING.md) · **Contract:** [API.md](API.md) · **Design:** [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Status at the time of writing

A working baseline is committed on `main`. It is a **starting point, not the finish line** — each
team extends its own area.

| Area | State |
| --- | --- |
| NestJS pipeline, one endpoint | done |
| 1NF / 2NF / 3NF / BCNF verdicts | done |
| 2NF, 3NF and BCNF decomposition | done |
| Multivalued dependency engine + tableau chase | done |
| 4NF and 5NF analysis | done |
| Step-by-step walkthrough, 1NF → 5NF | done |
| React app, routing, navigation, day/night mode | done |
| Schema text parser + input form + 5 examples | done |
| Results shell: verdict strip, keys, violations, steps | done |
| Learn content, all six normal forms | seeded, needs depth |
| 4NF / BCNF / 5NF result panels | done |
| Assistant: target schema + JSON export | done, needs depth |
| Report generation (Markdown, PDF) | **not started** |
| AI prompt log | **not started** |
| References list | **not started** |
| Interactive per-form visualizers | **not started** |

---

## Team 1 — TLE

**Members:** Raj, Kunal
**Branch:** `team1-tle`
**Full brief:** [TEAM-1-AND-TEAM-3-BRIEF.md](TEAM-1-AND-TEAM-3-BRIEF.md) section 8

### Raj

| # | Deliverable | Where |
| --- | --- | --- |
| R1 | **1NF visualizer** — show a repeating group and the relation it becomes | `frontend/src/features/first-to-third-nf/` |
| R2 | **2NF visualizer** — highlight the proper subset of the key causing the partial dependency | same folder |
| R3 | **Learn content: 1NF and 2NF** — deepen the seeded entries, add a third example each | `features/learn/normal-form-content.ts` |
| R4 | Tests for the 1NF/2NF views and any helper you add | alongside your components |

**Why it matters:** 2NF is the form students get wrong most often, because a relation can have
several candidate keys and a partial dependency against *any* of them is a violation. The
visualizer should make which key, and which subset, unmistakable.

### Kunal

| # | Deliverable | Where |
| --- | --- | --- |
| K1 | **3NF visualizer** — draw the transitive chain `key → X → Y` | `features/first-to-third-nf/` |
| K2 | **4NF visualizer** — show the two independent facts and why the cross-product is redundant | `features/four-nf/` |
| K3 | **References list** — Codd, Boyce–Codd, Fagin, Maier, plus a current textbook | new `features/learn/references.ts` |
| K4 | **Learn content: 3NF, BCNF, 4NF, 5NF** — deepen, and add the lossless decomposition section | `features/learn/normal-form-content.ts` |
| K5 | **4NF engine tests** — your own spec file, so it never conflicts with Team 2's | new `higher-nf.engine.4nf.spec.ts` |

**Why it matters:** 3NF and BCNF differ only in the *prime attribute* escape hatch, which is
invisible unless it is drawn. That contrast is the single most examinable idea in the module.

### Shared

- Compare-and-contrast table of all six forms, on the Learn page.
- The nesting diagram: `5NF ⟹ 4NF ⟹ BCNF ⟹ 3NF ⟹ 2NF ⟹ 1NF`.

### Boundary

Extend `analysisResults.tsx`'s extension points rather than rewriting it — **announce that edit
first**, Team 2 owns the file.

---

## Team 2 — TripleX

**Members:** Shreyansh, Aryan, Akshit
**Branch:** `team2-triplex`

Team 2 owns the BCNF and 5NF engines, the whole UI/UX layer, navigation, Help, and day/night mode.
The backend engines and the design system are already in place; the work below is what remains.

### Shreyansh — BCNF

| # | Deliverable | Where |
| --- | --- | --- |
| S1 | **BCNF decomposition visualizer** — animate the split of `R` into `X ∪ Y` and `R − (Y − X)` | `frontend/src/features/bcnf/BcnfDecompositionView.tsx` |
| S2 | **Show the violation that drives each split**, next to the relation it split | same |
| S3 | **Warn when a BCNF decomposition loses a dependency** — the classic trade-off against 3NF | backend + view |
| S4 | **Exhaustive BCNF tests** — including the case where BCNF holds but 3NF does not (impossible), and vice versa (the `Offering` example) | `bcnf.engine.spec.ts` |
| S5 | **Fix the BCNF engine's ordering bias** — it splits on the first violating dependency, so output order depends on input order. Make it deterministic. | `backend/src/normalization/engines/bcnf.engine.ts` |

**Why it matters:** S3 is the point of the BCNF/3NF distinction. A student should see that pushing
to BCNF can *cost* you dependency preservation.

### Aryan — 5NF

| # | Deliverable | Where |
| --- | --- | --- |
| A1 | **5NF visualizer** — draw the three-way join dependency and the three relations | `frontend/src/features/bcnf/FiveNfPanel.tsx` |
| A2 | **Extend the 5NF engine** — the current implementation derives candidates only from MVDs. Add detection of join dependencies implied by a *combination* of dependencies. | `higher-nf.engine.ts` |
| A3 | **Surface losslessness and dependency preservation** in the API response — `MvdEngine.isLossless()` already computes it but it is not exposed | `mvd.engine.ts`, `higher-nf.engine.ts`, DTO |
| A4 | **Interaction between 4NF and 5NF** — make the panels explain that a relation failing 4NF also fails 5NF | both panels |
| A5 | **5NF tests** — including an explicit `joinDependencies` case | `higher-nf.engine.5nf.spec.ts` |

**Why it matters:** A2 is the honest gap. The current 5NF check is a well-defined subset, documented
as such in [ARCHITECTURE.md](ARCHITECTURE.md#how-5nf-is-decided). Closing it — or precisely
characterising what it cannot catch — is the strongest technical contribution available.

### Akshit — UI/UX

| # | Deliverable | Where |
| --- | --- | --- |
| X1 | **Responsive audit** — the app is only checked at desktop width | `frontend/src/components/layout/`, pages |
| X2 | **Accessibility** — keyboard navigation of the nav and the verdict strip, focus order, live-region announcements for results, axe clean | repo-wide |
| X3 | **Help page depth** — worked walkthroughs, a glossary, an FAQ drawn from real confusion | `frontend/src/pages/HelpPage.tsx` |
| X4 | **Day/night mode polish** — verify contrast in both themes against WCAG AA; add a "follow system" option | `frontend/src/theme/`, `index.css` |
| X5 | **Loading and error states** — skeleton states, empty states, a retry affordance | `features/normalization/` |
| X6 | **Print stylesheet** — the results page should print cleanly for a submission | `index.css` |

**Why it matters:** the app is a teaching tool that will be demonstrated live and marked on
usability. X2 and X5 are the difference between "works" and "works when the examiner tries it".

### Boundary

`frontend/src/features/normalization/` is shared with Teams 1 and 3 — announce before editing.

---

## Team 3 — Automatic Normalization

**Member:** Kanishka
**Branch:** `team3-automatic-normalization`
**Full brief:** [TEAM-1-AND-TEAM-3-BRIEF.md](TEAM-1-AND-TEAM-3-BRIEF.md) section 9

| # | Deliverable | Where |
| --- | --- | --- |
| 3.1 | **Automatic normalization assistant** — show the full path from the input schema to the normalised one, not just the destination | `frontend/src/features/assistant/` |
| 3.2 | **Report generation** — JSON (started) plus **Markdown** and a print/PDF route | new `features/assistant/report.ts` |
| 3.3 | **AI prompt log** — record every prompt and response, render them on the Assistant page | new `features/assistant/prompt-log.ts` |
| 3.4 | **Overall integration** — keep `main` green, arbitrate shared-file conflicts, keep the contract in sync | repo-wide |
| 3.5 | **Input beyond typed text** — paste a `CREATE TABLE`, or CSV headers | `features/assistant/` |
| 3.6 | **Explain losslessness and dependency preservation** in the report | `report.ts` |

### 3.4 is the highest-value item

You are the only person whose job spans all three teams. Concretely:

- After **every** merge into `main`: `npm install && npm run lint && npm test && npm run build`.
- Keep `frontend/src/types/normalization.ts`, `backend/.../analyze-normalization.dto.ts`, and
  [API.md](API.md) in agreement. They are three copies of one contract.
- When Team 1 and Team 2 both want `AnalysisResults.tsx`, you decide.

### Boundary

`features/assistant/` is yours. `pages/AssistantPage.tsx` is yours. Everything else, announce first.

---

## Cross-team dependencies

These are the points where one team blocks another. Agree the interface early.

| Dependency | Blocked on | Owner |
| --- | --- | --- |
| Team 1 and Team 3 both render 4NF results | `higherNormalForms.decomposition` naming (`4NF_` / `5NF_` prefix) | Team 2 — settled |
| Team 3's report needs Learn content to quote | `normal-form-content.ts` being stable | Team 1 |
| Team 3's report needs losslessness | exposing `isLossless` in the response | Team 2 (A2/A3) |
| Team 1 and Team 2 both extend `AnalysisResults.tsx` | merge arbitration | Team 3 |
| Any contract change | DTO + type mirror + `API.md` | Team 3 |

---

## Checkpoints

| Checkpoint | Gate |
| --- | --- |
| **1** | Every team has pushed to its own branch; everyone can run `npm run dev` |
| **2** | Each team's feature works on its branch; first merges of `team1-*` and `team3-*` into `main` |
| **3** | All three merged; 1NF → 5NF works end to end; reports export |
| **4** | Freeze. Bug fixes only. Rehearse the demo. Verify the production build. |

Every merge into `main` must pass `npm run lint && npm test && npm run build` **before** it is
pushed. See [BRANCHING.md](BRANCHING.md#merging-a-team-branch-into-main).
