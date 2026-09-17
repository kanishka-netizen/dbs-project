export interface ImportedSchema {
  attributes: string[];
  functionalDependencies: {
    left: string[];
    right: string[];
  }[];
  multivaluedDependencies: {
    left: string[];
    right: string[];
  }[];
}

export interface ImportIssue {
  message: string;
}

export interface ImportResult {
  schema: ImportedSchema;
  issues: ImportIssue[];
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

function splitColumns(text: string): string[] {
  return text
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean)
    .map((column) => column.replace(/["`[\]]/g, ''));
}

/**
 * Parses a simple CREATE TABLE statement.
 *
 * Example:
 *
 * CREATE TABLE Student (
 *   StudentID INT PRIMARY KEY,
 *   StudentName VARCHAR(100),
 *   HostelBlock VARCHAR(10),
 *   RoomNumber VARCHAR(10)
 * );
 */
export function parseCreateTable(sql: string): ImportResult {
  const issues: ImportIssue[] = [];

  const match = sql.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`[]?(\w+)["`\]]?\s*\(([\s\S]*?)\)\s*;?/i,
  );

  if (!match) {
    return {
      schema: {
        attributes: [],
        functionalDependencies: [],
        multivaluedDependencies: [],
      },
      issues: [
        {
          message: 'Could not find a valid CREATE TABLE statement.',
        },
      ],
    };
  }

  const body = match[2];

  const definitions = body
    .split(',')
    .map((definition) => definition.trim())
    .filter(Boolean);

  const attributes: string[] = [];

  for (const definition of definitions) {
    const upper = definition.toUpperCase();

    // Skip table-level constraints.
    if (
      upper.startsWith('PRIMARY KEY') ||
      upper.startsWith('FOREIGN KEY') ||
      upper.startsWith('UNIQUE') ||
      upper.startsWith('CHECK') ||
      upper.startsWith('CONSTRAINT')
    ) {
      continue;
    }

    const columnMatch = definition.match(/^[`"[]?(\w+)[`"\]]?/);

    if (columnMatch) {
      attributes.push(columnMatch[1]);
    }
  }

  if (attributes.length === 0) {
    issues.push({
      message: 'No column definitions were found in the CREATE TABLE statement.',
    });
  }

  return {
    schema: {
      attributes: dedupe(attributes),
      functionalDependencies: [],
      multivaluedDependencies: [],
    },
    issues,
  };
}

/**
 * Parses the first row of a CSV as the relation attributes.
 *
 * Example:
 *
 * StudentID,StudentName,HostelBlock,RoomNumber
 * 101,Aarav,A,101
 * 102,Riya,B,203
 */
export function parseCsv(csv: string): ImportResult {
  const issues: ImportIssue[] = [];

  const firstLine = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return {
      schema: {
        attributes: [],
        functionalDependencies: [],
        multivaluedDependencies: [],
      },
      issues: [{ message: 'The CSV file is empty.' }],
    };
  }

  const attributes = splitColumns(firstLine);

  if (attributes.length === 0) {
    issues.push({
      message: 'No column names were found in the CSV header.',
    });
  }

  if (new Set(attributes).size !== attributes.length) {
    issues.push({
      message: 'The CSV header contains duplicate attribute names.',
    });
  }

  return {
    schema: {
      attributes: dedupe(attributes),
      functionalDependencies: [],
      multivaluedDependencies: [],
    },
    issues,
  };
}