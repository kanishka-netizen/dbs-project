# Branching

Three teams share this repository. The branch model exists to keep their work independent until it
is ready to integrate.

## The model

| Branch | Purpose | Lifetime |
| --- | --- | --- |
| `main` | Integration. Always deployable. **Protected — no direct commits.** | permanent |
| `team1-tle` | Team 1's integration branch | permanent |
| `team2-triplex` | Team 2's integration branch | permanent |
| `team3-automatic-normalization` | Team 3's integration branch | permanent |
| `feat/<team>-<slug>` | One piece of work | short |
| `fix/<team>-<slug>` | One bug fix | short |
| `docs/<team>-<slug>` | Documentation only | short |
| `test/<team>-<slug>` | Tests only | short |
| `chore/<slug>` | Tooling, root config | short |

```
main ──●────────────────●────────────────────────●──────────►
        \                \                        \
         \                \                        \
   team1-tle ──●──●───────●──── (merged)            \
               \  \                                 \
      feat/team1-a ●──● (PR → team1-tle)             \
                                                      \
   team2-triplex ──●──●───────────────────────────────●── (merged)
   team3-automatic-normalization ──●──●───────────────────────►
```

### The two-hop rule

Work flows **`feat/*` → `teamN-*` → `main`**. Never branch a feature off `main`. Never PR straight
to `main`.

The team branch absorbs the small conflicts inside a team's own area. `main` only ever sees three
merges per checkpoint, so a conflict on `main` is a genuine cross-team disagreement that deserves
a conversation — not a routine rebase.

## Naming

```
feat/team2-five-nf-engine
fix/team1-trivial-dependency-check
docs/team3-report-format
```

Lowercase, hyphenated, team prefix on `feat`/`fix`/`docs`/`test`. Keep the slug short — it is a
label, not a description.

## Day-to-day

### Start

```bash
git checkout team2-triplex
git pull
git checkout -b feat/team2-five-nf-engine
```

### Finish

```bash
npm install                # if dependencies changed
npm run lint
npm test
npm run build              # all three must pass

git add -A
git commit                 # see commit messages below
git push -u origin feat/team2-five-nf-engine
```

Open a pull request into **your team branch**. One teammate reviews. Squash or merge — either is
fine, as long as the team branch history stays readable.

### Keep up to date

Rebase your feature branch on your team branch rather than merging it in:

```bash
git fetch origin
git rebase origin/team2-triplex
```

Resolve conflicts by understanding both sides. If a conflict is in another team's folder, stop and
ask — it means someone edited outside their area.

## Merging a team branch into `main`

Team leads only, at the agreed integration checkpoints.

```bash
git checkout main
git pull
git merge --no-ff team2-triplex -m "merge: team2-triplex into main"

npm install       # dependencies may have changed
npm run lint
npm test
npm run build     # this is what CI would run
```

**If any of the four commands fails, do not push the merge.** Fix it on the team branch first.

`--no-ff` is deliberate: it keeps a visible merge commit, so the history shows exactly when each
team's work landed.

### After the merge

```bash
git push origin main

# bring the other team branches up to date
git checkout team1-tle
git merge main
git push origin team1-tle
```

Tell the other two teams as soon as `main` moves. Everyone rebases their team branch before their
next feature.

## Protecting `main`

The repository owner should configure branch protection on GitHub:

- Require a pull request before merging.
- Require at least one approving review.
- Require the status checks to pass, if CI is added.
- Do not allow force pushes or deletions.

Until that is configured, `main` is protected by convention only. Do not be the person who breaks
it.

## Commit messages

```
type(scope): subject
```

| Type | Use for |
| --- | --- |
| `feat` | New behaviour |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `test` | Tests only |
| `refactor` | No behaviour change |
| `chore` | Tooling, dependencies, root config |

Scope is the team tag or the area: `team1`, `team2`, `team3`, `backend`, `frontend`, `docs`.

```
feat(team2): implement the 5NF join-dependency engine
fix(team1): skip trivial FDs in the 3NF check
docs(team3): describe the report export format
test(team2): cover BCNF decomposition on the offering example
chore: adopt npm workspaces at the repository root
```

Subject under 72 characters, imperative mood. Explain **why** in the body when it is not obvious —
the "what" is already in the diff.

## Resolving conflicts

Most conflicts will be in one of four shared files:

| File | Who arbitrates |
| --- | --- |
| `frontend/src/features/normalization/AnalysisResults.tsx` | Team 2 (owner), Team 3 (integration) |
| `frontend/src/types/normalization.ts` | Team 3 (integration owner) |
| `backend/src/normalization/normalization.service.ts` | Team 3 (integration owner) |
| `docs/API.md` | Team 3 (integration owner) |

Procedure:

1. **Do not force a resolution.** Read both sides.
2. If one side is a superset of the other, take the superset.
3. If they genuinely conflict, the owner decides, and the decision is recorded in the commit
   message.
4. Re-run `npm run lint && npm test && npm run build` afterwards. Always.

## Pull request checklist

- [ ] Branched off my team branch, not `main`
- [ ] Scoped to one feature or one fix
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] New behaviour is covered by a test
- [ ] `docs/API.md` and `types/normalization.ts` updated if the contract changed
- [ ] No files touched outside my team's area — or the team channel was notified
- [ ] No secret committed
