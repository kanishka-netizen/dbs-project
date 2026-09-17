# API

The backend exposes a single endpoint. This document is the **canonical contract** — if it
disagrees with the code, one of them is a bug.

| | |
| --- | --- |
| Base URL (dev) | `http://localhost:3001` |
| Browser path | `/api/normalization/analyze` — Vite proxies `/api` to `:3001` |
| Method | `POST` |
| Content type | `application/json` |
| CORS | `http://localhost:3000` (only needed if you bypass the proxy) |

---

## Request

```http
POST /normalization/analyze
Content-Type: application/json
```

```json
{
  "relationName": "Supply",
  "attributes": ["Supplier", "Part", "Project"],
  "functionalDependencies": [
    { "left": ["Supplier", "Part"], "right": ["Project"] }
  ],
  "multivaluedDependencies": [
    { "left": ["Supplier"], "right": ["Part"] }
  ],
  "joinDependencies": [
    { "relations": [["A", "B"], ["B", "C"], ["A", "C"]] }
  ]
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `relationName` | `string` | yes | Display name only; it has no effect on the analysis |
| `attributes` | `string[]` | yes | Every attribute in the relation |
| `functionalDependencies` | `{ left: string[], right: string[] }[]` | yes | May be empty |
| `multivaluedDependencies` | `{ left: string[], right: string[] }[]` | no | **Required for 4NF and 5NF to mean anything** |
| `joinDependencies` | `{ relations: string[][] }[]` | no | Asserted join dependencies |

---

## Response — accepted

HTTP **200** with `valid: true`.

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

  "violations": [],
"decomposition": [],

"decompositionProperties": {
  "lossless": true,
  "dependencyPreserving": true
},

"bcnfDecomposition": [
    {
      "name": "BCNF_R1",
      "attributes": ["Supplier", "Part", "Project"],
      "reason": "Relation satisfies BCNF after decomposition."
    }
  ],

  "higherNormalForms": {
    "normalForms": { "4NF": false, "5NF": false },
    "highestNormalForm": null,
    "violations": [
      {
        "normalForm": "4NF",
        "dependency": "Supplier ->> Part",
        "reason": "The determinant {Supplier} is not a superkey, but it multivalues {Part}."
      },
      {
        "normalForm": "5NF",
        "dependency": "(Supplier, Part) ⨝ (Supplier, Project) ⨝ (Part, Project)",
        "reason": "The relation is the lossless join of three smaller relations, so it stores no fact that they do not already store."
      }
    ],
    "decomposition": [
      { "name": "4NF_R1", "attributes": ["Supplier", "Part"], "reason": "Result of the 4NF decomposition." },
      { "name": "4NF_R2", "attributes": ["Supplier", "Project"], "reason": "Result of the 4NF decomposition." },
      { "name": "5NF_R1", "attributes": ["Supplier", "Part"], "reason": "Result of the 5NF decomposition." },
      { "name": "5NF_R2", "attributes": ["Supplier", "Project"], "reason": "Result of the 5NF decomposition." },
      { "name": "5NF_R3", "attributes": ["Part", "Project"], "reason": "Result of the 5NF decomposition." }
    ]
  },

  "steps": [
    {
      "step": 1,
      "title": "Find Candidate Keys",
      "description": "Candidate keys are identified using attribute closure and functional dependencies.",
      "result": "Candidate Key(s): {Supplier, Part, Project}"
    }
  ],

  "warnings": []
}
```

### Field reference

| Field | Type | Meaning |
| --- | --- | --- |
| `relation` | `string` | Echo of `relationName` |
| `valid` | `true` | Discriminant |
| `attributes` | `string[]` | Echo of the request |
| `functionalDependencies` | `FunctionalDependency[]` | Echo |
| `multivaluedDependencies` | `MultivaluedDependency[]` | Echo; `[]` when omitted |
| `candidateKeys` | `string[][]` | Every minimal superkey. `[]` if none exists |
| `normalForms` | `{ '1NF','2NF','3NF','BCNF': boolean }` | 1NF–BCNF verdicts |
| `highestNormalForm` | `NormalForm` | Overall winner, reconciled across both verdict objects |
| `violations` | `NormalFormViolation[]` | Functional-dependency violations, 2NF–BCNF |
| `decomposition` | `DecomposedRelation[]` | 2NF **or** 3NF decomposition, whichever applies |
| `decompositionProperties` | `{ lossless: boolean, dependencyPreserving: boolean }` | Whether the resulting decomposition is lossless-join and dependency-preserving |
| `bcnfDecomposition` | `DecomposedRelation[]` | BCNF analysis algorithm output |
| `higherNormalForms` | `HigherNormalFormResult` | 4NF/5NF verdicts, violations, decomposition |
| `steps` | `NormalizationStep[]` | Numbered walkthrough, 1 → 8 |
| `warnings` | `string[]` | Non-fatal notices, e.g. a trivial dependency |

```ts
type NormalForm = '1NF' | '2NF' | '3NF' | 'BCNF' | '4NF' | '5NF';

interface NormalFormViolation {
  normalForm: string;      // '2NF' | '3NF' | 'BCNF'
  dependency: string;      // 'A, B -> C'
  reason: string;
}

interface HigherNormalFormViolation {
  normalForm: '4NF' | '5NF';
  dependency: string;      // 'A ->> B' or '(A, B) ⨝ (B, C)'
  reason: string;
}

interface DecomposedRelation {
  name: string;            // prefixed: 'R_1', 'BCNF_R1', '4NF_R1', '5NF_R1'
  attributes: string[];
  reason: string;
}

interface HigherNormalFormResult {
  normalForms: { '4NF': boolean; '5NF': boolean };
  highestNormalForm: '4NF' | '5NF' | null;
  violations: HigherNormalFormViolation[];
  decomposition: DecomposedRelation[];
}

interface NormalizationStep {
  step: number;
  title: string;
  description: string;
  result: string;
}
```

---

## Response — rejected

Validation failure is **not** an HTTP error. It is HTTP **200** with `valid: false`.

```json
{
  "relation": "R",
  "valid": false,
  "errors": [
    "Functional dependency 1 contains unknown attribute(s): Z",
    "Duplicate attribute(s): A"
  ],
  "warnings": []
}
```

When `valid` is `false`, **neither `normalForms` nor `higherNormalForms` exists**. Always check
`valid` before reading anything else.

### What the validator rejects

| Condition | Message |
| --- | --- |
| No attributes | `At least one attribute is required.` |
| Repeated attribute | `Duplicate attribute(s): A` |
| Empty left side | `Functional dependency 1 has an empty left-hand side.` |
| Empty right side | `Functional dependency 1 has an empty right-hand side.` |
| Attribute not declared | `Functional dependency 1 contains unknown attribute(s): Z` |

### What the validator warns about

A dependency whose right-hand side is already contained in its left-hand side, such as
`A, B -> A`, is trivial. It holds everywhere, so it is warned about rather than rejected:

```json
{ "warnings": ["Functional dependency 1 is trivial: A, B -> A."] }
```

Trivial dependencies are **skipped** by the 3NF and BCNF checks — they can never be a violation.

---

## Reading the response

### Verdicts are split across two objects

```ts
// 1NF–BCNF
response.normalForms['3NF'];

// 4NF–5NF
response.higherNormalForms.normalForms['5NF'];
```

Use the helper in `frontend/src/types/normalization.ts` to get one ordered list:

```ts
import { orderedVerdicts } from '../types/normalization';

const verdicts = orderedVerdicts(response);
// [{ normalForm: '1NF', satisfied: true }, ..., { normalForm: '5NF', satisfied: false }]
```

### `highestNormalForm` can be below 4NF even when `higherNormalForms` looks clean

`higherNormalForms.highestNormalForm` is `null` when the relation has not reached BCNF. The
top-level `highestNormalForm` is then the 1NF–BCNF winner:

```
Offering(Student, Course, Instructor)
  normalForms          → 3NF true, BCNF false
  highestNormalForm    → "3NF"
  higherNormalForms.highestNormalForm → null
```

### Filter decompositions by their name prefix

Both the 4NF and 5NF splits come back in one `decomposition` array:

```ts
const fourNf  = response.higherNormalForms.decomposition.filter((r) => r.name.startsWith('4NF_'));
const fiveNf  = response.higherNormalForms.decomposition.filter((r) => r.name.startsWith('5NF_'));
```

Prefixes in use: `R_` (2NF/3NF), `BCNF_R` (BCNF), `4NF_R`, `5NF_R`.

### 5NF implies 4NF

A relation failing 4NF also fails 5NF, and both violations are reported. A relation failing 4NF
gets both a `4NF_` and a `5NF_` decomposition.

---

## Multivalued dependencies, and the trap

`X ->> Y` is **trivial** when `Y ⊆ X`, or when `X ∪ Y` covers the whole relation. A trivial MVD
constrains nothing and is skipped.

This catches people out. For `Supply(Supplier, Part, Project)`:

```
Supplier, Part ->> Project      TRIVIAL  (Supplier ∪ Part ∪ Project = the whole relation)
Supplier      ->> Part          real     (constrains the relation)
Supplier      ->> Project       real, and the same dependency as the line above
```

The first line is silently ignored. Use the singular form:

```
attributes: Supplier, Part, Project

Supplier ->> Part
Supplier ->> Project
```

The engine expands each declared MVD with its **complement**, `X ->> (R - X - Y)`, so declaring
one of the complementary pair is enough.

---

## Schema text format (client-side)

The visualizer takes text, not JSON. `frontend/src/features/normalization/schema-text.ts` converts
it and returns `{ schema, issues }`.

```
attributes: StudentID, CourseID, CourseName

# a functional dependency
StudentID, CourseID -> CourseName

// a multivalued dependency
CourseID ->> CourseName
```

| Rule | Detail |
| --- | --- |
| Attribute line | `attributes:` / `attribute:` / `=`, or the first bare line |
| Functional dependency | `->`, or `→` |
| Multivalued dependency | `->>`, or `↠` |
| Multiple attributes | comma separated: `A, B -> C, D` |
| Comments | `#`, `--`, `//` to end of line |
| Blank lines | ignored |
| Missing attribute line | derived from the union of every dependency |

Any unreadable line produces a `ParseIssue` with its line number, and the form refuses to submit.

---

## Error handling in the client

`frontend/src/lib/api.ts` exports `analyzeNormalization()` and `ApiError`.

- **Network failure or non-2xx** → throws `ApiError`.
- **`valid: false`** → resolves normally; check the discriminant.
- **Aborted** → rethrows the `DOMException`, which `useNormalizationAnalysis` swallows.

`useNormalizationAnalysis` keeps only the newest request in flight, so a fast typist cannot render
a stale result.
