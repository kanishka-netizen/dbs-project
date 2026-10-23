import type {
  DecomposedTable,
  LosslessJoinResult,
  TableInstance,
  TableRow,
} from './table-types';

/** Helper to generate a unique key for a row under a set of attributes. */
function rowFingerprint(row: TableRow, attrs: string[]): string {
  return attrs
    .map((attr) => String(row[attr] !== undefined ? row[attr] : ''))
    .join('␟');
}

/**
 * Projects a set of rows onto a subset of attributes (pi_attrs(R)).
 * Automatically eliminates duplicate tuples as per relational algebra.
 */
export function projectRelation(
  originalRows: TableRow[],
  attributes: string[],
): TableRow[] {
  const seen = new Set<string>();
  const distinctRows: TableRow[] = [];

  for (const row of originalRows) {
    const projectedRow: TableRow = {};
    for (const attr of attributes) {
      projectedRow[attr] = row[attr] !== undefined ? row[attr] : '';
    }

    const fingerprint = rowFingerprint(projectedRow, attributes);
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      distinctRows.push(projectedRow);
    }
  }

  return distinctRows;
}

/** Computes the natural join (R1 bowtie R2) between two tables. */
export function naturalJoinTwoTables(
  t1Rows: TableRow[],
  t1Attrs: string[],
  t2Rows: TableRow[],
  t2Attrs: string[],
): { rows: TableRow[]; attributes: string[] } {
  // Find common attributes
  const commonAttrs = t1Attrs.filter((a) => t2Attrs.includes(a));
  const allAttrs = Array.from(new Set([...t1Attrs, ...t2Attrs]));

  // Index t2 rows by common attributes
  const index = new Map<string, TableRow[]>();
  for (const row2 of t2Rows) {
    const key = rowFingerprint(row2, commonAttrs);
    const existing = index.get(key) || [];
    existing.push(row2);
    index.set(key, existing);
  }

  const resultRows: TableRow[] = [];
  const seen = new Set<string>();

  for (const row1 of t1Rows) {
    const key = rowFingerprint(row1, commonAttrs);
    const matchingRows2 = index.get(key);

    if (matchingRows2 && matchingRows2.length > 0) {
      for (const row2 of matchingRows2) {
        const joinedRow: TableRow = { ...row1, ...row2 };
        const fp = rowFingerprint(joinedRow, allAttrs);
        if (!seen.has(fp)) {
          seen.add(fp);
          resultRows.push(joinedRow);
        }
      }
    } else if (commonAttrs.length === 0) {
      // Cartesian product if no common attributes
      for (const row2 of t2Rows) {
        const joinedRow: TableRow = { ...row1, ...row2 };
        const fp = rowFingerprint(joinedRow, allAttrs);
        if (!seen.has(fp)) {
          seen.add(fp);
          resultRows.push(joinedRow);
        }
      }
    }
  }

  return { rows: resultRows, attributes: allAttrs };
}

/**
 * Computes the full natural join reconstruction of decomposed tables and tests
 * whether the decomposition is lossless on the actual data.
 */
export function verifyLosslessJoinOnData(
  originalTable: TableInstance,
  decomposedTables: DecomposedTable[],
): LosslessJoinResult {
  if (decomposedTables.length <= 1) {
    return {
      isLossless: true,
      originalRowCount: originalTable.rows.length,
      reconstructedRowCount: originalTable.rows.length,
      reconstructedRows: originalTable.rows,
      spuriousTupleCount: 0,
      missingTupleCount: 0,
    };
  }

  // Iteratively compute natural join: R1 bowtie R2 bowtie R3 ...
  let currentAttrs = [...decomposedTables[0].attributes];
  let currentRows = [...decomposedTables[0].rows];

  for (let i = 1; i < decomposedTables.length; i++) {
    const nextTable = decomposedTables[i];
    const joined = naturalJoinTwoTables(
      currentRows,
      currentAttrs,
      nextTable.rows,
      nextTable.attributes,
    );
    currentAttrs = joined.attributes;
    currentRows = joined.rows;
  }

  // Compare currentRows (reconstructed) against originalTable.rows
  const originalAttrs = originalTable.columns.map((c) => c.name);
  const originalSet = new Set<string>();
  for (const row of originalTable.rows) {
    originalSet.add(rowFingerprint(row, originalAttrs));
  }

  const reconstructedSet = new Set<string>();
  let spuriousCount = 0;
  for (const row of currentRows) {
    const fp = rowFingerprint(row, originalAttrs);
    reconstructedSet.add(fp);
    if (!originalSet.has(fp)) {
      spuriousCount++;
    }
  }

  let missingCount = 0;
  for (const row of originalTable.rows) {
    const fp = rowFingerprint(row, originalAttrs);
    if (!reconstructedSet.has(fp)) {
      missingCount++;
    }
  }

  const isLossless = spuriousCount === 0 && missingCount === 0;

  return {
    isLossless,
    originalRowCount: originalTable.rows.length,
    reconstructedRowCount: currentRows.length,
    reconstructedRows: currentRows,
    spuriousTupleCount: spuriousCount,
    missingTupleCount: missingCount,
  };
}

/** Generates executable SQL*Plus DDL & DML script for decomposed tables. */
export function exportDecomposedTablesSql(
  decomposedTables: DecomposedTable[],
  originalColumns: TableInstance['columns'],
): string {
  const colTypeMap = new Map<string, string>();
  originalColumns.forEach((c) => colTypeMap.set(c.name, c.type || 'VARCHAR2(100)'));

  const lines: string[] = [
    '-- ========================================================',
    '-- SQL*Plus Normalized Schema Script',
    `-- Generated: ${new Date().toLocaleString()}`,
    '-- ========================================================',
    '',
  ];

  for (const table of decomposedTables) {
    lines.push(`-- Table: ${table.name}`);
    if (table.reason) {
      lines.push(`-- Reason: ${table.reason}`);
    }
    lines.push(`CREATE TABLE ${table.name} (`);

    const colDefs: string[] = [];
    table.attributes.forEach((attr) => {
      const type = colTypeMap.get(attr) || 'VARCHAR2(100)';
      const isPk = table.primaryKey?.includes(attr);
      colDefs.push(`  ${attr} ${type}${isPk ? ' NOT NULL' : ''}`);
    });

    if (table.primaryKey && table.primaryKey.length > 0) {
      colDefs.push(`  PRIMARY KEY (${table.primaryKey.join(', ')})`);
    }

    lines.push(colDefs.join(',\n'));
    lines.push(');');
    lines.push('');

    // Insert statements
    if (table.rows.length > 0) {
      lines.push(`-- Data rows for ${table.name} (${table.rows.length} rows)`);
      for (const row of table.rows) {
        const vals = table.attributes.map((attr) => {
          const val = row[attr];
          if (val === undefined || val === '') return 'NULL';
          if (typeof val === 'number') return String(val);
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        lines.push(`INSERT INTO ${table.name} (${table.attributes.join(', ')}) VALUES (${vals.join(', ')});`);
      }
      lines.push('');
    }

    lines.push('COMMIT;');
    lines.push('');
  }

  return lines.join('\n');
}
