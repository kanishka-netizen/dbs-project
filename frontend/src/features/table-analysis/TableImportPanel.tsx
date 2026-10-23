import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { parseDeviceFile } from './table-import';
import type { TableInstance } from './table-types';

interface TableImportPanelProps {
  onTableImported: (table: TableInstance) => void;
}

const SAMPLE_FILES = [
  {
    name: '1NF: Student Profile',
    badge: '1NF',
    sqlFile: '/samples/1nf_student_profile.sql',
    csvFile: '/samples/1nf_student_profile.csv',
  },
  {
    name: '2NF: Student Course',
    badge: '2NF',
    sqlFile: '/samples/2nf_student_course.sql',
    csvFile: '/samples/2nf_student_course.csv',
  },
  {
    name: '3NF: Employee Dept',
    badge: '3NF',
    sqlFile: '/samples/3nf_employee_dept.sql',
    csvFile: '/samples/3nf_employee_dept.csv',
  },
  {
    name: 'BCNF: Student Advisor',
    badge: 'BCNF',
    sqlFile: '/samples/bcnf_student_advisor.sql',
    csvFile: '/samples/bcnf_student_advisor.csv',
  },
  {
    name: '4NF: Faculty Course Book',
    badge: '4NF',
    sqlFile: '/samples/4nf_faculty_course_book.sql',
    csvFile: '/samples/4nf_faculty_course_book.csv',
  },
  {
    name: '5NF: Supply Chain',
    badge: '5NF',
    sqlFile: '/samples/5nf_project_supply_chain.sql',
    csvFile: '/samples/5nf_project_supply_chain.csv',
  },
];

export function TableImportPanel({ onTableImported }: TableImportPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setError(null);
    setLoading(true);

    try {
      const result = await parseDeviceFile(file);
      if (result.table && result.table.rows.length >= 0) {
        onTableImported(result.table);
      } else {
        setError(
          result.issues.length > 0
            ? result.issues.join('\n')
            : 'Could not parse a table from the uploaded file.',
        );
      }
    } catch (err) {
      setError(`Failed to read file: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadSampleDirectly(url: string, fileName: string) {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], fileName);
      await processFile(file);
    } catch (err) {
      setError(`Failed to load sample: ${(err as Error).message}`);
      setLoading(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  }

  return (
    <div className="card-padded space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          Import Table from Your Device
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload a file containing table data. Supported formats: <strong>.csv</strong> (comma-separated values), <strong>.sql</strong> (SQL*Plus DDL & DML script), or <strong>.json</strong> (array of row objects).
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
            : 'border-slate-300 hover:border-purple-400 dark:border-slate-700 dark:hover:border-purple-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.sql,.json,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-2xl text-purple-600 dark:text-purple-400">
          📁
        </div>

        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {loading ? 'Processing file...' : 'Choose a file or drag & drop it here'}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          CSV, SQL*Plus DDL/DML, or JSON
        </p>

        <button
          type="button"
          disabled={loading}
          className="btn btn-secondary mt-4 text-xs"
        >
          Browse Device Files
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <strong>Import Error:</strong>
          <pre className="mt-1 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {/* Download Sample Files Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <div className="mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Download Sample Files to Test Uploading:
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Click <strong>Download (.sql / .csv)</strong> to save to your computer, or click <strong>Load Directly</strong>:
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_FILES.map((sample) => (
            <div
              key={sample.name}
              className="rounded-lg border border-slate-200 p-2.5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={sample.name}>
                  {sample.name}
                </span>
                <span className="chip-brand text-[9px] font-bold shrink-0">
                  {sample.badge}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <a
                  href={sample.sqlFile}
                  download
                  className="rounded bg-white px-2 py-1 font-mono font-medium text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                >
                  📥 .SQL
                </a>
                <a
                  href={sample.csvFile}
                  download
                  className="rounded bg-white px-2 py-1 font-mono font-medium text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                >
                  📥 .CSV
                </a>
                <button
                  type="button"
                  onClick={() =>
                    loadSampleDirectly(sample.sqlFile, sample.sqlFile.split('/').pop() || 'sample.sql')
                  }
                  className="ml-auto text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                >
                  Load Directly ➜
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
