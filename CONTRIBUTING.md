# Contributing

Three teams share this repository. Follow these rules so parallel work stays mergeable.

## Before you start

```bash
npm install          # from the repository root, installs all workspaces
npm run dev          # backend :3001 + frontend :3000
```

## Branching

| Branch | Purpose |
| --- | --- |
| `main` | Integration branch. Always deployable. **Never commit directly.** |
| `team1-tle` | Team 1 integration branch |
| `team2-triplex` | Team 2 integration branch |
| `team3-automatic-normalization` | Team 3 integration branch |
| `feat/<team>-<short-description>` | A single piece of work |
| `fix/<team>-<short-description>` | A bug fix |

Full details, naming rules and the merge flow: **[docs/BRANCHING.md](docs/BRANCHING.md)**.

## Workflow

1. Branch off **your team branch**, never off `main`.
   ```bash
   git checkout team2-triplex
   git pull
   git checkout -b feat/team2-five-nf-engine
   ```
2. Make the change. Keep it scoped to one feature or one fix.
3. Verify locally **before** opening a pull request:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
4. Open a PR into your **team branch**. One teammate reviews it.
5. Your team lead merges the team branch into `main` at the integration checkpoints.

## Stay out of other teams' folders

Each team owns specific directories. Editing another team's area causes the merge conflicts
this branch model exists to prevent. The ownership map is in
[docs/WORK-DIVISION.md](docs/WORK-DIVISION.md).

If you need something changed in a shared file (`README.md`, `docs/`, root `package.json`,
`backend/src/normalization/normalization.service.ts`), announce it in the team channel first.

## Commit messages

Use the conventional prefix plus your team tag:

```
feat(team2): implement 5NF join-dependency detection
fix(team1): skip trivial FDs in the 3NF check
docs(team3): document the report export format
test(team2): cover BCNF decomposition on lossless cases
chore: add concurrently for the root dev script
```

Keep the subject under 72 characters. Explain **why** in the body when the reason is not obvious.

## Code style

- **TypeScript everywhere.** No `any` — use the types in `backend/src/normalization/engines/`.
- Formatting is enforced by Prettier: `npm run format`.
- Linting is oxlint: `npm run lint`. CI-level clean.
- The backend is **ESM** — relative imports need the `.js` extension:
  ```ts
  import { CandidateKeyEngine } from './engines/candidate-key.engine.js';
  ```
- Match the surrounding code. Files in this repo are written in a consistent, heavily
  line-broken style — keep it.

## Tests are not optional

Every engine change needs a test. Engines are static, pure classes, which makes them cheap to
test directly:

```ts
import { describe, expect, it } from 'vitest';
import { BCNFEngine } from './bcnf.engine.js';

describe('BCNFEngine', () => {
  it('decomposes a relation that violates BCNF', () => {
    const result = BCNFEngine.decompose(
      ['A', 'B', 'C'],
      [{ left: ['A', 'B'], right: ['C'] }],
    );

    expect(result).toHaveLength(1);
  });
});
```

Run a single file while iterating:

```bash
npm run test:backend -- src/normalization/engines/bcnf.engine.spec.ts
```

## Changing the API contract

The request and response shapes are a shared interface between all three teams. If you need to
change one:

1. Update `backend/src/normalization/dto/analyze-normalization.dto.ts`.
2. Update the mirror in `frontend/src/types/normalization.ts`.
3. Update **[docs/API.md](docs/API.md)**.
4. Tell the other two teams — this is a breaking change for them.

## Pull request checklist

- [ ] Branched off my team branch, not `main`
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] New behaviour is covered by a test
- [ ] `docs/API.md` updated if the contract changed
- [ ] No files touched outside my team's area (or announced if so)
