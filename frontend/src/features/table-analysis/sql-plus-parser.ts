import type { ColumnDefinition, TableInstance, TableRow } from './table-types';

export interface SqlParseResult {
  tables: TableInstance[];
  issues: string[];
}

/** Removes SQL line comments, block comments, and SQL*Plus REM comments. */
function stripComments(sql: string): string {
  // Strip block comments /* ... */
  let cleaned = sql.replace(/\/\*[\s\S]*?\*\//g, '');

  // Strip single-line comments -- ... and REM / REMARK ...
  cleaned = cleaned
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return (
        !trimmed.startsWith('--') &&
        !trimmed.toUpperCase().startsWith('REM ') &&
        !trimmed.toUpperCase().startsWith('REMARK ')
      );
    })
    .join('\n');

  return cleaned;
}

/** Splits SQL text into individual statements by semicolon or slash. */
function splitStatements(sql: string): string[] {
  const cleaned = stripComments(sql);
  const statements: string[] = [];
  let current = '';
  let inString = false;
  let quoteChar = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const prevChar = i > 0 ? cleaned[i - 1] : '';

    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        // Check for escaped quote in SQL ''
        if (cleaned[i + 1] === char) {
          current += char;
          i++; // skip next quote
        } else {
          inString = false;
        }
      }
    }

    if (!inString && (char === ';' || (char === '/' && (i === cleaned.length - 1 || cleaned[i + 1] === '\n')))) {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

/** Parses value literals: 'string', 123, 45.67, NULL. */
function parseValueLiteral(raw: string): string | number {
  const trimmed = raw.trim();

  if (trimmed.toUpperCase() === 'NULL') {
    return '';
  }

  // Quoted string '...' or "..."
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    const unquoted = trimmed.slice(1, -1).replace(/''/g, "'");
    return unquoted;
  }

  // Numeric
  if (!isNaN(Number(trimmed)) && trimmed !== '') {
    return Number(trimmed);
  }

  return trimmed;
}

/** Parses comma-separated arguments inside parentheses, respecting quotes. */
function parseParenList(content: string): string[] {
  const items: string[] = [];
  let current = '';
  let inString = false;
  let quoteChar = '';
  let depth = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if ((char === "'" || char === '"') && content[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (char === ',' && depth === 0) {
        items.push(current.trim());
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    items.push(current.trim());
  }

  return items;
}

/** Parses a CREATE TABLE statement. */
function parseCreateTable(statement: string): { name: string; columns: ColumnDefinition[] } | null {
  const match = statement.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`[]?([A-Za-z0-9_]+)["`\]]?\s*\(([\s\S]+)\)/i,
  );

  if (!match) return null;

  const tableName = match[1];
  const body = match[2];
  const items = parseParenList(body);
  const columns: ColumnDefinition[] = [];
  const primaryKeyCols = new Set<string>();

  // Check for table-level PRIMARY KEY (col1, col2)
  for (const item of items) {
    const pkMatch = item.match(/(?:CONSTRAINT\s+\w+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
    if (pkMatch) {
      const pks = pkMatch[1].split(',').map((c) => c.trim().replace(/["`[\]]/g, ''));
      pks.forEach((col) => primaryKeyCols.add(col.toLowerCase()));
    }
  }

  for (const item of items) {
    const trimmed = item.trim();
    const upper = trimmed.toUpperCase();

    // Skip table-level constraints
    if (
      upper.startsWith('PRIMARY KEY') ||
      upper.startsWith('FOREIGN KEY') ||
      upper.startsWith('UNIQUE') ||
      upper.startsWith('CHECK') ||
      upper.startsWith('CONSTRAINT')
    ) {
      continue;
    }

    const tokens = trimmed.split(/\s+/);
    if (tokens.length >= 2) {
      const colName = tokens[0].replace(/["`[\]]/g, '');
      const colType = tokens[1].replace(/,$/, '');
      const isPk = upper.includes('PRIMARY KEY') || primaryKeyCols.has(colName.toLowerCase());

      columns.push({
        name: colName,
        type: colType,
        isPrimaryKey: isPk,
      });
    }
  }

  return { name: tableName, columns };
}

/** Parses an INSERT INTO statement. */
function parseInsertInto(statement: string): { tableName: string; rows: TableRow[] } | null {
  // Pattern: INSERT INTO table_name [(col1, col2)] VALUES (val1, val2), (...);
  const match = statement.match(
    /INSERT\s+INTO\s+["`[]?([A-Za-z0-9_]+)["`\]]?(?:\s*\(([^)]+)\))?\s+VALUES\s*([\s\S]+)/i,
  );

  if (!match) return null;

  const tableName = match[1];
  const explicitCols = match[2]
    ? match[2].split(',').map((c) => c.trim().replace(/["`[\]]/g, ''))
    : null;
  const valuesPart = match[3].trim();

  // Extract each tuple inside parentheses: (...), (...)
  const rowTuples: string[] = [];
  let inString = false;
  let quoteChar = '';
  let inParen = false;
  let currentTuple = '';

  for (let i = 0; i < valuesPart.length; i++) {
    const char = valuesPart[i];

    if ((char === "'" || char === '"') && valuesPart[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '(') {
        inParen = true;
        currentTuple = '';
        continue;
      } else if (char === ')') {
        inParen = false;
        rowTuples.push(currentTuple);
        currentTuple = '';
        continue;
      }
    }

    if (inParen) {
      currentTuple += char;
    }
  }

  const rows: TableRow[] = [];

  for (const tuple of rowTuples) {
    const rawValues = parseParenList(tuple);
    const parsedValues = rawValues.map(parseValueLiteral);
    const rowObj: TableRow = {};

    if (explicitCols) {
      explicitCols.forEach((col, idx) => {
        rowObj[col] = parsedValues[idx] !== undefined ? parsedValues[idx] : '';
      });
    } else {
      // Unspecified columns; keyed by index temporarily until mapped to table schema
      parsedValues.forEach((val, idx) => {
        rowObj[`__col_${idx}`] = val;
      });
    }

    rows.push(rowObj);
  }

  return { tableName, rows };
}

/** Parses full SQL / SQL*Plus script containing CREATE TABLE and INSERT INTO statements. */
export function parseSqlPlusScript(sql: string): SqlParseResult {
  const issues: string[] = [];
  const tableMap = new Map<string, TableInstance>();

  const statements = splitStatements(sql);

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (!trimmed) continue;

    const upper = trimmed.toUpperCase();

    if (upper.startsWith('CREATE TABLE')) {
      const parsed = parseCreateTable(trimmed);
      if (parsed) {
        const canonicalName = parsed.name;
        if (!tableMap.has(canonicalName)) {
          tableMap.set(canonicalName, {
            name: canonicalName,
            columns: parsed.columns,
            rows: [],
          });
        } else {
          // Update columns if table was created previously without column metadata
          const existing = tableMap.get(canonicalName)!;
          existing.columns = parsed.columns;
        }
      } else {
        issues.push(`Failed to parse CREATE TABLE statement: "${trimmed.slice(0, 60)}..."`);
      }
    } else if (upper.startsWith('INSERT INTO')) {
      const parsed = parseInsertInto(trimmed);
      if (parsed) {
        let table = tableMap.get(parsed.tableName);
        if (!table) {
          // Look case-insensitively
          for (const [key, val] of tableMap.entries()) {
            if (key.toLowerCase() === parsed.tableName.toLowerCase()) {
              table = val;
              break;
            }
          }
        }

        if (table) {
          // Map raw __col_X keys to actual column names if needed
          const colNames = table.columns.map((c) => c.name);
          for (const rawRow of parsed.rows) {
            const normalizedRow: TableRow = {};
            colNames.forEach((col, idx) => {
              if (rawRow[col] !== undefined) {
                normalizedRow[col] = rawRow[col];
              } else if (rawRow[`__col_${idx}`] !== undefined) {
                normalizedRow[col] = rawRow[`__col_${idx}`];
              } else {
                normalizedRow[col] = '';
              }
            });
            table.rows.push(normalizedRow);
          }
        } else {
          // Table wasn't created yet by CREATE TABLE. Create inferred table
          const firstRow = parsed.rows[0] || {};
          const keys = Object.keys(firstRow);
          const cols: ColumnDefinition[] = keys.map((k, idx) => ({
            name: k.startsWith('__col_') ? `Col_${idx + 1}` : k,
            type: 'VARCHAR2(100)',
          }));

          const newTable: TableInstance = {
            name: parsed.tableName,
            columns: cols,
            rows: parsed.rows.map((row) => {
              const res: TableRow = {};
              cols.forEach((col, idx) => {
                const rawKey = keys[idx];
                res[col.name] = row[rawKey] !== undefined ? row[rawKey] : '';
              });
              return res;
            }),
          };

          tableMap.set(parsed.tableName, newTable);
        }
      } else {
        issues.push(`Failed to parse INSERT statement: "${trimmed.slice(0, 60)}..."`);
      }
    }
  }

  const tables = Array.from(tableMap.values());

  if (tables.length === 0 && issues.length === 0) {
    issues.push('No valid CREATE TABLE or INSERT INTO statements were found.');
  }

  return { tables, issues };
}
