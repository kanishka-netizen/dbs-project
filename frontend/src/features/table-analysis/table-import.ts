import type { ColumnDefinition, TableInstance, TableRow } from './table-types';
import { parseSqlPlusScript } from './sql-plus-parser';

export interface FileImportResult {
  table: TableInstance | null;
  issues: string[];
}

/** Parses standard CSV with support for quoted strings, commas, and line breaks. */
export function parseCsvTable(csvText: string, tableName = 'Imported_Table'): FileImportResult {
  const issues: string[] = [];
  const lines: string[][] = [];

  let currentField = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip CRLF
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((field) => field.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { table: null, issues: ['The uploaded CSV file is empty.'] };
  }

  const rawHeaders = lines[0];
  const colNames = rawHeaders.map((h, i) => h.replace(/["`[\]]/g, '') || `Col_${i + 1}`);

  if (new Set(colNames).size !== colNames.length) {
    issues.push('CSV contains duplicate column headers. Suffixes were added to make them unique.');
  }

  // Deduplicate column names if needed
  const uniqueCols: string[] = [];
  const seenCols = new Map<string, number>();
  for (const name of colNames) {
    const count = seenCols.get(name) || 0;
    if (count === 0) {
      uniqueCols.push(name);
      seenCols.set(name, 1);
    } else {
      const uniqueName = `${name}_${count + 1}`;
      uniqueCols.push(uniqueName);
      seenCols.set(name, count + 1);
    }
  }

  const rows: TableRow[] = [];

  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    const rowObj: TableRow = {};
    uniqueCols.forEach((col, idx) => {
      const val = line[idx] !== undefined ? line[idx] : '';
      // Numeric check
      if (val !== '' && !isNaN(Number(val))) {
        rowObj[col] = Number(val);
      } else {
        rowObj[col] = val;
      }
    });
    rows.push(rowObj);
  }

  // Infer basic column types
  const columns: ColumnDefinition[] = uniqueCols.map((col) => {
    const hasValues = rows.some((row) => row[col] !== '' && row[col] !== undefined);
    const allNumeric = hasValues && rows.every((row) => row[col] === '' || typeof row[col] === 'number');
    return {
      name: col,
      type: allNumeric ? 'NUMBER' : 'VARCHAR2(100)',
    };
  });

  return {
    table: {
      name: tableName,
      columns,
      rows,
    },
    issues,
  };
}

/** Parses JSON file containing array of objects or table descriptor. */
export function parseJsonTable(jsonText: string, tableName = 'Imported_Table'): FileImportResult {
  try {
    const parsed = JSON.parse(jsonText);

    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        return { table: null, issues: ['JSON array is empty.'] };
      }

      // Collect all keys across all objects
      const allKeys = new Set<string>();
      parsed.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach((k) => allKeys.add(k));
        }
      });

      const colNames = Array.from(allKeys);
      const rows: TableRow[] = parsed.map((item) => {
        const rowObj: TableRow = {};
        colNames.forEach((col) => {
          rowObj[col] = item[col] !== undefined ? item[col] : '';
        });
        return rowObj;
      });

      const columns: ColumnDefinition[] = colNames.map((col) => {
        const allNumeric = rows.every((r) => r[col] === '' || typeof r[col] === 'number');
        return {
          name: col,
          type: allNumeric ? 'NUMBER' : 'VARCHAR2(100)',
        };
      });

      return {
        table: {
          name: tableName,
          columns,
          rows,
        },
        issues: [],
      };
    } else if (typeof parsed === 'object' && parsed !== null) {
      if (Array.isArray(parsed.rows)) {
        const inferredName = parsed.name || tableName;
        let columns: ColumnDefinition[] = [];

        if (Array.isArray(parsed.columns)) {
          columns = parsed.columns.map((c: string | ColumnDefinition) =>
            typeof c === 'string' ? { name: c, type: 'VARCHAR2(100)' } : c,
          );
        } else if (parsed.rows.length > 0) {
          columns = Object.keys(parsed.rows[0]).map((k) => ({
            name: k,
            type: 'VARCHAR2(100)',
          }));
        }

        return {
          table: {
            name: inferredName,
            columns,
            rows: parsed.rows,
          },
          issues: [],
        };
      }
    }

    return { table: null, issues: ['Unrecognized JSON format. Expected an array of row objects.'] };
  } catch (err) {
    return { table: null, issues: [`Invalid JSON: ${(err as Error).message}`] };
  }
}

/** Parses uploaded device file by extension. */
export async function parseDeviceFile(file: File): Promise<FileImportResult> {
  const content = await file.text();
  const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_') || 'Imported_Table';
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    return parseCsvTable(content, baseName);
  } else if (ext === 'json') {
    return parseJsonTable(content, baseName);
  } else if (ext === 'sql' || ext === 'txt') {
    const sqlResult = parseSqlPlusScript(content);
    if (sqlResult.tables.length > 0) {
      return {
        table: sqlResult.tables[0],
        issues: sqlResult.issues,
      };
    }
    // Fallback to CSV if SQL parse returned 0 tables
    const csvResult = parseCsvTable(content, baseName);
    if (csvResult.table && csvResult.table.rows.length > 0) {
      return csvResult;
    }
    return {
      table: null,
      issues: sqlResult.issues.length > 0 ? sqlResult.issues : ['Could not extract any table data.'],
    };
  }

  return { table: null, issues: [`Unsupported file format (.${ext}). Please upload a .csv, .sql, or .json file.`] };
}
