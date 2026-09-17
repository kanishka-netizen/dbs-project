# Team 3 — Automatic Normalization

**Member:** Kanishka
**Branch:** `team3-automatic-normalization`
**Main technical work:** Automatic Normalization Assistant
**Extra responsibilities:** Download / report generation, AI prompt log, overall integration

---

## Your area

```
frontend/src/features/assistant/        AssistantPanel.tsx, report.ts, prompt-log.ts
frontend/src/pages/AssistantPage.tsx
frontend/src/lib/download.ts
docs/API.md                             you are the arbiter
```

Everything else is someone else's — but see *Integration* below, which is the exception and the
most valuable thing you do.

## Getting started

```bash
git checkout team3-automatic-normalization
git pull
npm install
npm run dev
```

Read, in this order:

1. [ARCHITECTURE.md](../ARCHITECTURE.md) — how the pieces fit
2. [API.md](../API.md) — you own this document
3. `frontend/src/features/assistant/AssistantPanel.tsx` — your starting point
4. `frontend/src/features/normalization/resolve-normalized-schema.ts` — how the target schema is chosen
5. `frontend/src/features/learn/normal-form-content.ts` — content your report can quote

## What is already in place

The Assistant page works end to end: enter a schema, get the normalised relations, download a JSON
report. `resolveNormalizedSchema()` picks the deepest decomposition available
(4NF/5NF → BCNF → 2NF/3NF → unchanged) and `lib/download.ts` handles the file download.

The Learn content is seeded with all six forms, which means your report has real prose to draw on
rather than generic filler.

## What is missing — your job

| # | Deliverable | Where |
| --- | --- | --- |
| 3.1 | **Show the full path**, not just the destination — 1NF → fix → 2NF → fix → … | `features/assistant/` |
| 3.2 | **Report generation** — JSON (started), plus **Markdown**, plus a print/PDF route | new `features/assistant/report.ts` |
| 3.3 | **AI prompt log** — record every prompt and response, render on the Assistant page | new `features/assistant/prompt-log.ts` |
| 3.4 | **Integration owner** — keep `main` green, arbitrate shared files, keep the contract in sync | repo-wide |
| 3.5 | **Input beyond typed text** — paste a `CREATE TABLE`, or CSV headers | `features/assistant/` |
| 3.6 | **Explain losslessness and dependency preservation** in the report | `report.ts` |

### 3.1 — the path, not the destination

Right now a user sees where they end up and nothing about how they got there. The response already
carries `steps` — eight numbered entries from candidate keys to the final verdict. Use it to drive
a stepper or a diff view: *"this relation is in 1NF; here is the 2NF fix; here is the 3NF fix…"*.

### 3.2 — make `report.ts` pure

Keep it free of React so it is cheap to test:

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

Move the JSON-building logic out of `AssistantPanel` and into here.

For PDF: Markdown → a print-styled page → the browser's `Ctrl+P` is the cheapest reliable route.
Generating a PDF in the browser needs a dependency — **get agreement before adding one.**

### 3.3 — the AI prompt log

```ts
export interface PromptLogEntry {
  id: string;
  timestamp: string;
  purpose: string;      // "Explain the 3NF violation"
  prompt: string;
  response: string;
  model?: string;
}
```

**If you call an AI service, the key comes from an environment variable and is never committed.**
Add the variable name to a `.env.example`; the real `.env` is already gitignored. If you have no
API access, build the log as a documented, manually-maintained record of the prompts used while
developing — that satisfies the deliverable honestly and holds up in a viva.

### 3.4 — integration, the highest-value item

You are the only person whose job spans all three teams.

- After **every** merge into `main`:
  ```bash
  npm install && npm run lint && npm test && npm run build
  ```
- Keep these three in agreement — they are three copies of one contract:
  1. `backend/src/normalization/dto/analyze-normalization.dto.ts`
  2. `frontend/src/types/normalization.ts`
  3. `docs/API.md`
- When Team 1 and Team 2 both want `AnalysisResults.tsx`, you decide.

## Definition of done

- [ ] The assistant shows the full normalisation path, not just the destination
- [ ] JSON **and** Markdown export both work; the Markdown is presentable as a submitted report
- [ ] `report.ts` is pure, exported, and covered by tests
- [ ] The AI prompt log holds real entries and renders on the Assistant page
- [ ] No secret is committed; `.env.example` documents what is needed
- [ ] `main` builds, lints, and tests green after every team merge
- [ ] `docs/API.md` and `types/normalization.ts` match the backend
- [ ] `npm run lint && npm test && npm run build` all pass

## Full brief

[docs/TEAM-1-AND-TEAM-3-BRIEF.md](../TEAM-1-AND-TEAM-3-BRIEF.md) section 9.
