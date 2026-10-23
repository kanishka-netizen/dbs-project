import type { CellViolation1NF, DiscoveredFD, TableRow } from './table-types';

/** Serializes a tuple of attribute values into a hashable cache key. */
function tupleKey(row: TableRow, attrs: string[]): string {
  return attrs.map((a) => String(row[a] !== undefined ? row[a] : '')).join('␟');
}

/** Checks whether a specific FD (left -> right) holds on the given table rows. */
export function checkFunctionalDependency(
  rows: TableRow[],
  left: string[],
  right: string[],
): DiscoveredFD {
  if (rows.length <= 1) {
    return { left, right, holds: true };
  }

  // Map from serialized left tuple -> { rightTuple: string, rowIndex: number }
  const seen = new Map<string, { rightTuple: string; rowIndex: number }>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const leftVal = tupleKey(row, left);
    const rightVal = tupleKey(row, right);

    const existing = seen.get(leftVal);
    if (existing) {
      if (existing.rightTuple !== rightVal) {
        const leftDisplay = left.map((a) => `${a} = '${row[a]}'`).join(', ');
        const r1Display = right.map((a) => `${a} = '${rows[existing.rowIndex][a]}'`).join(', ');
        const r2Display = right.map((a) => `${a} = '${row[a]}'`).join(', ');

        return {
          left,
          right,
          holds: false,
          conflictingRows: [existing.rowIndex, i],
          conflictExplanation: `Row ${existing.rowIndex + 1} and Row ${i + 1} have identical left-hand side (${leftDisplay}), but conflicting right-hand side (${r1Display} vs ${r2Display}).`,
        };
      }
    } else {
      seen.set(leftVal, { rightTuple: rightVal, rowIndex: i });
    }
  }

  return { left, right, holds: true };
}

/** Discovers all minimal, non-trivial functional dependencies holding on table rows. */
export function discoverFunctionalDependencies(
  rows: TableRow[],
  attributes: string[],
  maxDeterminantSize = 2,
): DiscoveredFD[] {
  if (rows.length === 0 || attributes.length <= 1) {
    return [];
  }

  const discovered: DiscoveredFD[] = [];

  // Helper to check if a determinant is already subsumed by a smaller known FD
  function isSubsumed(left: string[], rightAttr: string): boolean {
    return discovered.some(
      (known) =>
        known.right.includes(rightAttr) &&
        known.left.every((attr) => left.includes(attr)),
    );
  }

  // 1. Single attribute determinants: A -> B
  for (const leftAttr of attributes) {
    for (const rightAttr of attributes) {
      if (leftAttr === rightAttr) continue;

      const fd = checkFunctionalDependency(rows, [leftAttr], [rightAttr]);
      if (fd.holds) {
        discovered.push(fd);
      }
    }
  }

  // 2. Pair determinants: (A, B) -> C (if maxDeterminantSize >= 2)
  if (maxDeterminantSize >= 2 && attributes.length >= 3) {
    for (let i = 0; i < attributes.length; i++) {
      for (let j = i + 1; j < attributes.length; j++) {
        const leftPair = [attributes[i], attributes[j]];

        for (const rightAttr of attributes) {
          if (leftPair.includes(rightAttr)) continue;
          if (isSubsumed(leftPair, rightAttr)) continue;

          const fd = checkFunctionalDependency(rows, leftPair, [rightAttr]);
          if (fd.holds) {
            discovered.push(fd);
          }
        }
      }
    }
  }

  return discovered;
}

/** Discovers minimal candidate keys from actual table rows. */
export function discoverCandidateKeys(
  rows: TableRow[],
  attributes: string[],
  maxKeySize = 3,
): string[][] {
  if (rows.length === 0 || attributes.length === 0) {
    return [];
  }

  const candidateKeys: string[][] = [];

  // Check if a subset uniquely identifies all rows
  function isUniqueSuperkey(candidate: string[]): boolean {
    const seen = new Set<string>();
    for (const row of rows) {
      const key = tupleKey(row, candidate);
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  }

  // Check if candidate is a superset of an already discovered minimal key
  function isSubsumedKey(candidate: string[]): boolean {
    return candidateKeys.some((k) => k.every((attr) => candidate.includes(attr)));
  }

  // Enumerate by increasing size: 1, 2, 3...
  for (let size = 1; size <= Math.min(attributes.length, maxKeySize); size++) {
    const combinations = getCombinations(attributes, size);
    for (const combo of combinations) {
      if (isSubsumedKey(combo)) continue;
      if (isUniqueSuperkey(combo)) {
        candidateKeys.push(combo);
      }
    }
  }

  // If no candidate key found under maxKeySize, full attribute set is the fallback key
  if (candidateKeys.length === 0) {
    candidateKeys.push([...attributes]);
  }

  return candidateKeys;
}

/** Generates combinations of size k from an array. */
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const head = arr[0];
  const tail = arr.slice(1);
  const withHead = getCombinations(tail, k - 1).map((c) => [head, ...c]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}

/** Checks real data cells for 1NF atomicity violations (multi-valued entries). */
export function check1NFAtomicity(
  rows: TableRow[],
  columns: string[],
): { is1NF: boolean; violations: CellViolation1NF[] } {
  const violations: CellViolation1NF[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (const col of columns) {
      const val = row[col];
      if (typeof val === 'string') {
        const trimmed = val.trim();

        // Check for comma, semicolon, or slash separated values
        // Ignore single quotes or numbers
        const isBracketList =
          (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          (trimmed.startsWith('{') && trimmed.endsWith('}'));

        const commaCount = (trimmed.match(/,/g) || []).length;
        const semicolonCount = (trimmed.match(/;/g) || []).length;
        const hasDelimiter = commaCount >= 1 || semicolonCount >= 1;

        if (isBracketList) {
          const inner = trimmed.slice(1, -1);
          const suggested = inner
            .split(/[,;]/)
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);

          violations.push({
            rowIndex: r,
            column: col,
            value: trimmed,
            reason: `Cell contains an array/collection value '${trimmed}', which is non-atomic.`,
            suggestedValues: suggested,
          });
        } else if (hasDelimiter && !trimmed.match(/^\s*\d+,\d{2}\s*$/)) {
          // Avoid matching currency like 1,000.00
          const items = trimmed
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);

          if (items.length > 1) {
            violations.push({
              rowIndex: r,
              column: col,
              value: trimmed,
              reason: `Cell contains multiple comma/semicolon-separated values (${items.length} items).`,
              suggestedValues: items,
            });
          }
        }
      }
    }
  }

  return {
    is1NF: violations.length === 0,
    violations,
  };
}
