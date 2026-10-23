import { useState } from 'react';
import { parseSqlPlusScript } from './sql-plus-parser';
import type { TableInstance } from './table-types';

interface SqlPlusConsoleProps {
  onTableCreated: (table: TableInstance) => void;
  defaultSql?: string;
}

const TEMPLATE_SQL = `CREATE TABLE Student_Enrollment (
  RollNo NUMBER,
  StudentName VARCHAR2(50),
  CourseID VARCHAR2(10),
  CourseName VARCHAR2(50),
  Department VARCHAR2(20),
  Instructor VARCHAR2(50)
);

INSERT INTO Student_Enrollment VALUES (101, 'Aarav Sharma', 'CS101', 'Data Structures', 'CSE', 'Dr. Sharma');
INSERT INTO Student_Enrollment VALUES (101, 'Aarav Sharma', 'CS102', 'Algorithms', 'CSE', 'Dr. Verma');
INSERT INTO Student_Enrollment VALUES (102, 'Riya Patel', 'CS101', 'Data Structures', 'CSE', 'Dr. Sharma');
INSERT INTO Student_Enrollment VALUES (103, 'Kabir Mehta', 'EC201', 'Signals', 'ECE', 'Dr. Rao');
INSERT INTO Student_Enrollment VALUES (104, 'Ananya Roy', 'EC201', 'Signals', 'ECE', 'Dr. Rao');
COMMIT;`;

export function SqlPlusConsole({
  onTableCreated,
  defaultSql = TEMPLATE_SQL,
}: SqlPlusConsoleProps) {
  const [sqlText, setSqlText] = useState(defaultSql);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleExecute() {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!sqlText.trim()) {
      setErrorMsg('Please enter SQL statements to execute.');
      return;
    }

    const { tables, issues } = parseSqlPlusScript(sqlText);

    if (issues.length > 0 && tables.length === 0) {
      setErrorMsg(issues.join('\n'));
      return;
    }

    if (tables.length === 0) {
      setErrorMsg('No tables could be parsed from the script.');
      return;
    }

    const mainTable = tables[0];
    setSuccessMsg(
      `Table "${mainTable.name}" successfully created with ${mainTable.columns.length} columns and ${mainTable.rows.length} rows!`,
    );
    onTableCreated(mainTable);
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white dark:border-slate-800">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500"></span>
          <span>SQL*Plus Console</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSqlText(TEMPLATE_SQL)}
            className="text-xs text-slate-300 hover:text-white underline transition"
          >
            Load Template
          </button>
          <button
            type="button"
            onClick={() => setSqlText('')}
            className="text-xs text-slate-300 hover:text-white underline transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-950 font-mono text-xs">
        <textarea
          rows={10}
          value={sqlText}
          onChange={(e) => setSqlText(e.target.value)}
          placeholder="Enter CREATE TABLE and INSERT INTO statements..."
          className="w-full resize-y bg-transparent text-emerald-400 placeholder-slate-600 outline-none leading-relaxed"
          spellCheck={false}
        />
      </div>

      {errorMsg && (
        <div className="border-t border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <strong>Syntax Error:</strong>
          <pre className="mt-1 whitespace-pre-wrap">{errorMsg}</pre>
        </div>
      )}

      {successMsg && (
        <div className="border-t border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          ✓ {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Supports Oracle SQL*Plus DDL & DML (`CREATE TABLE`, `INSERT INTO`, `NUMBER`, `VARCHAR2`, etc.)
        </span>
        <button
          type="button"
          onClick={handleExecute}
          className="btn btn-primary text-xs"
        >
          ▶ Execute SQL Script
        </button>
      </div>
    </div>
  );
}
