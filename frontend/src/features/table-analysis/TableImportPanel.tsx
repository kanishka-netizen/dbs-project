import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { parseDeviceFile } from './table-import';
import type { TableInstance } from './table-types';

interface TableImportPanelProps {
  onTableImported: (table: TableInstance) => void;
}

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
    <div className="card-padded">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
        Import Table from Your Device
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Upload a file containing table data. Supported formats: <strong>.csv</strong> (comma-separated values), <strong>.sql</strong> (SQL*Plus DDL & DML script), or <strong>.json</strong> (array of row objects).
      </p>

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
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <strong>Import Error:</strong>
          <pre className="mt-1 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
    </div>
  );
}
