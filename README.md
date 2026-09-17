# DBS Project — Database Normalization Visualizer & Assistant

An interactive web application that analyses a relational schema against **1NF through 5NF**,
explains *why* each normal form holds or fails, visualises the decomposition step by step, and
can normalise a schema automatically.

Built by three subteams working in parallel on one monorepo.

---

## The problem

Normalization is taught as a set of definitions, but students rarely get to *see* the process.
Given a relation and a set of functional dependencies, it is hard to answer:

- Which normal form does this relation actually satisfy?
- Which dependency is the one that breaks it?
- What does the decomposition look like, and why is it lossless?
- What is the *next* normal form, and what would fixing it cost?

This project turns that into a guided, visual tool.

---

## Subteams

| Subteam | Members | Main technical work | Extra / common responsibilities |
| --- | --- | --- | --- |
| **Team 1 — TLE** | Raj, Kunal | 1NF, 2NF, 3NF, 4NF visualizer | Learn section, references, educational content |
| **Team 2 — TripleX** | Shreyansh, Aryan, Akshit | BCNF, 5NF + BCNF decomposition visualizer | UI/UX, website navigation, help, day/night mode |
| **Team 3 — Automatic Normalization** | Kanishka | Automatic Normalization Assistant | Download / report generation, AI prompt log, overall integration |

Ownership boundaries are defined in [docs/WORK-DIVISION.md](docs/WORK-DIVISION.md).
Each team has its own long-lived branch — see [docs/BRANCHING.md](docs/BRANCHING.md).

---

## Stack

| Layer | Technology |
| --- | --- |
| Backend | NestJS 12, TypeScript 6, ESM, Vitest, oxlint |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Language | TypeScript end to end |
| Tooling | npm workspaces, Prettier, concurrently |

The normalization logic lives entirely on the backend as a set of pure, independently
testable **engines**. The frontend is a rendering layer over one API endpoint.

---

## Repository layout

```
dbs-project/
├── backend/                  NestJS API — all normalization logic
│   └── src/normalization/
│       ├── engines/          one engine per normal form / concern
│       ├── dto/              request contract
│       └── normalization.*   module, controller, service pipeline
├── frontend/                 React + Vite single-page app
│   └── src/
│       ├── features/         one folder per team's feature area
│       ├── components/       shared UI, layout, theme
│       ├── pages/            route-level views
│       ├── lib/              API client
│       └── types/            API contract mirror
└── docs/                     architecture, API, branching, work division
```

---

## Getting started

Requires **Node.js >= 20.19**.

```bash
# from the repository root — installs both workspaces
npm install

# run backend (:3001) and frontend (:3000) together
npm run dev
```

Then open <http://localhost:3000>.

### Other commands

```bash
npm run build          # build backend then frontend
npm test               # run both test suites
npm run lint           # lint both workspaces
npm run format         # format both workspaces
```

Individual workspaces:

```bash
npm run dev:backend    # NestJS in watch mode on :3001
npm run dev:frontend   # Vite dev server on :3000
npm run test:backend
npm run test:frontend
```

---

## Documentation

| Document | Contents |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, engine pipeline, modal vs. relational normalization |
| [docs/API.md](docs/API.md) | The `POST /normalization/analyze` contract in full |
| [docs/BRANCHING.md](docs/BRANCHING.md) | Branch model, commit conventions, PR flow |
| [docs/WORK-DIVISION.md](docs/WORK-DIVISION.md) | Every deliverable, mapped to a team and a person |
| [docs/teams/](docs/teams/) | Per-team briefs |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

---

## Repository status

The `frontend/` directory was previously committed as a **broken git submodule pointer**
(gitlink without a `.gitmodules` entry, pointing at a commit that does not exist). No frontend
source was ever committed, so it has been rebuilt from scratch in this repository. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#a-note-on-the-frontend-history).
