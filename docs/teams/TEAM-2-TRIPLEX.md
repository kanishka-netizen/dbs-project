# Team 2 — TripleX

**Members:** Shreyansh, Aryan, Akshit
**Branch:** `team2-triplex`
**Main technical work:** BCNF, 5NF + BCNF decomposition visualizer
**Extra responsibilities:** UI/UX, website navigation, help, day/night mode

---

## Your area

```
frontend/src/features/bcnf/          BcnfDecompositionView.tsx, FiveNfPanel.tsx
frontend/src/components/layout/      AppShell, Navbar, ThemeToggle, nav-items
frontend/src/theme/                  ThemeProvider, useTheme
frontend/src/index.css               the design system
frontend/src/pages/HelpPage.tsx      Help
backend/src/normalization/engines/bcnf.engine.ts
backend/src/normalization/engines/mvd.engine.ts
backend/src/normalization/engines/higher-nf.engine.ts
```

You also **own** the shared files Teams 1 and 3 edit — `features/normalization/AnalysisResults.tsx`
in particular. That makes you the owner, not the only editor: expect pull requests against it and
review them rather than racing them.

## Getting started

```bash
git checkout team2-triplex
git pull
npm install
npm run dev
```

Read, in this order:

1. [ARCHITECTURE.md](../ARCHITECTURE.md) — especially *The chase* and *How 5NF is decided*
2. [API.md](../API.md) — the contract
3. `backend/src/normalization/engines/mvd.engine.ts` — the tableau chase
4. `backend/src/normalization/engines/higher-nf.engine.ts` — 4NF and 5NF
5. `backend/src/normalization/engines/bcnf.engine.ts` — the BCNF analysis algorithm

## What is already in place

The whole UI/UX layer, navigation, Help page, and day/night mode are **built**: class-based dark
mode with a pre-paint script (no flash), the `@utility` design system, responsive nav with a mobile
menu, and a skip link.

On the backend, `MvdEngine` (triviality, complementation, closure, chase) and
`HigherNormalFormEngine` (4NF, 5NF, gating on BCNF) are working and tested — 46 backend tests pass.

## What is missing — your job

### Shreyansh — BCNF

| # | Deliverable |
| --- | --- |
| S1 | BCNF decomposition **visualizer** — animate `R` splitting into `X ∪ Y` and `R − (Y − X)` |
| S2 | Show the **violation that drove each split**, beside the relation it split |
| S3 | **Warn when a BCNF decomposition loses a dependency** — the key trade-off against 3NF |
| S4 | Exhaustive BCNF tests, including the `Offering` case that separates 3NF from BCNF |
| S5 | Make BCNF output **order-independent** — the loop splits on the first violating dependency, so output follows input order |

**S3 is the point.** Pushing to BCNF can cost you dependency preservation. A student should see
that happen.

### Aryan — 5NF

| # | Deliverable |
| --- | --- |
| A1 | **5NF visualizer** — draw the three-way join dependency and the three relations |
| A2 | **Extend the 5NF engine** — it currently derives candidates only from MVDs; add detection of join dependencies implied by a *combination* of dependencies |
| A3 | **Expose losslessness and dependency preservation** in the API response — `MvdEngine.isLossless()` computes it but nothing returns it |
| A4 | Make the 4NF and 5NF panels explain that failing 4NF means failing 5NF |
| A5 | 5NF tests, including an explicit `joinDependencies` case |

**A2 is the honest gap.** The current 5NF check is a documented subset — see
[ARCHITECTURE.md](../ARCHITECTURE.md#how-5nf-is-decided). Closing it, or precisely characterising
what it cannot catch, is the strongest technical contribution on the table.

### Akshit — UI/UX

| # | Deliverable |
| --- | --- |
| X1 | **Responsive audit** — the app is only verified at desktop width |
| X2 | **Accessibility** — keyboard navigation, focus order, live-region announcements for results, axe clean |
| X3 | **Help page depth** — worked walkthroughs, a glossary, an FAQ from real confusion |
| X4 | **Day/night contrast** — verify both themes against WCAG AA; add a "follow system" option |
| X5 | **Loading and error states** — skeletons, empty states, a retry affordance |
| X6 | **Print stylesheet** — results should print cleanly for a submission |

**X2 and X5 matter most.** The app is demoed live and marked on usability. They are the difference
between "works" and "works when the examiner tries it".

## Things worth knowing

**Trivial MVDs are skipped.** `X ->> Y` is trivial when `Y ⊆ X` or `X ∪ Y` covers the relation.
So `Supplier, Part ->> Project` on `Supply(Supplier, Part, Project)` constrains nothing — use
`Supplier ->> Part`.

**4NF implies BCNF.** `HigherNormalFormEngine.analyze()` takes the BCNF verdict as its fifth
parameter. Without it, a relation with no MVDs satisfies 4NF and 5NF vacuously while failing BCNF.
Do not remove that guard.

**The chase is capped** at 200 rows and 200 steps, so a pathological input cannot hang a request.

**Decompositions are named by prefix** — `R_` (2NF/3NF), `BCNF_R`, `4NF_R`, `5NF_R`. Filter before
rendering, or each panel shows the others' relations.

**Tailwind v4 `@apply` only sees real utilities.** Add a reusable class as `@utility` in
`frontend/src/index.css`, not `@layer components` — a class in `@layer components` cannot be
composed into another.

## Definition of done

- [ ] The BCNF decomposition animates, and each split shows the violation that caused it
- [ ] A dependency-losing BCNF decomposition is flagged as such
- [ ] 5NF shows its three-way join dependency and the resulting relations
- [ ] `isLossless` is exposed through the API and documented in `API.md` and `types/normalization.ts`
- [ ] The BCNF decomposition is deterministic for a given dependency set
- [ ] Both themes pass WCAG AA contrast; the nav is keyboard operable
- [ ] `npm run lint && npm test && npm run build` all pass

## Full brief

[docs/WORK-DIVISION.md](../WORK-DIVISION.md) — the Team 2 section.
