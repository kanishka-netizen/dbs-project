import { useState } from 'react';
import type { DecomposedTable, LosslessJoinResult, TableInstance } from './table-types';
import { exportDecomposedTablesSql } from './table-normalizer';

interface DecomposedTablesViewProps {
  originalTable: TableInstance;
  decomposedTables: DecomposedTable[];
  losslessJoin: LosslessJoinResult;
}

export function DecomposedTablesView({
  originalTable,
  decomposedTables,
  losslessJoin,
}: DecomposedTablesViewProps) {
  const [activeTab, setActiveTab] = useState<'tables' | 'join' | 'sql'>('tables');
  const [copied, setCopied] = useState(false);

  const sqlScript = exportDecomposedTablesSql(decomposedTables, originalTable.columns);

  function handleCopySql() {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadSql() {
    const blob = new Blob([sqlScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${originalTable.name}_normalized_schema.sql`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header & Lossless badge */}
      <div className="card-padded flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Decomposed Normalized Tables (Projected on Actual Rows)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Decomposed into {decomposedTables.length} relations using relational projection (π).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {losslessJoin.isLossless ? (
            <span className="chip-success px-3 py-1 text-xs font-bold">
              ✓ Lossless Natural Join Verified ({losslessJoin.originalRowCount} original = {losslessJoin.reconstructedRowCount} reconstructed rows, 0 spurious)
            </span>
          ) : (
            <span className="chip-danger px-3 py-1 text-xs font-bold">
              ⚠️ Lossy Join Warning ({losslessJoin.spuriousTupleCount} spurious tuples detected)
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'tables'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Decomposed Sub-Tables ({decomposedTables.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('join')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'join'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Natural Join Proof (R₁ ⋈ R₂)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'sql'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Export SQL*Plus Script
        </button>
      </div>

      {/* Tab 1: Decomposed Sub-Tables */}
      {activeTab === 'tables' && (
        <div className="grid gap-6 md:grid-cols-2">
          {decomposedTables.map((subTable) => (
            <div key={subTable.name} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                <div>
                  <h4 className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {subTable.name}
                  </h4>
                  {subTable.reason && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {subTable.reason}
                    </p>
                  )}
                </div>
                <span className="chip-neutral text-xs">
                  {subTable.rows.length} {subTable.rows.length === 1 ? 'row' : 'rows'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                      <th className="w-10 px-3 py-2 text-center text-slate-400">#</th>
                      {subTable.attributes.map((attr) => {
                        const isPk = subTable.primaryKey?.includes(attr);
                        return (
                          <th key={attr} className="px-3 py-2 font-mono font-semibold">
                            <span className="text-slate-900 dark:text-white">{attr}</span>
                            {isPk && (
                              <span className="ml-1 rounded bg-amber-500/10 px-1 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                PK
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {subTable.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={subTable.attributes.length + 1}
                          className="py-4 text-center text-slate-500"
                        >
                          No tuples.
                        </td>
                      </tr>
                    ) : (
                      subTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-1.5 font-mono text-center text-slate-400">
                            {rIdx + 1}
                          </td>
                          {subTable.attributes.map((attr) => (
                            <td key={attr} className="px-3 py-1.5 font-mono text-slate-800 dark:text-slate-200">
                              {row[attr] !== undefined && row[attr] !== '' ? String(row[attr]) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Natural Join Proof */}
      {activeTab === 'join' && (
        <div className="card-padded space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Natural Join Reconstruction: R' = {decomposedTables.map((t) => t.name).join(' ⋈ ')}
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              When decomposed sub-tables are joined on their shared foreign/primary keys, the resulting table must equal the original table without losing tuples or inventing spurious tuples.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50 text-center">
              <span className="text-xs text-slate-500 block">Original Row Count</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {losslessJoin.originalRowCount}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50 text-center">
              <span className="text-xs text-slate-500 block">Reconstructed Rows</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {losslessJoin.reconstructedRowCount}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50 text-center">
              <span className="text-xs text-slate-500 block">Spurious (Phantom) Tuples</span>
              <span
                className={`text-xl font-bold ${
                  losslessJoin.spuriousTupleCount === 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {losslessJoin.spuriousTupleCount}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50 text-center">
              <span className="text-xs text-slate-500 block">Missing Original Tuples</span>
              <span
                className={`text-xl font-bold ${
                  losslessJoin.missingTupleCount === 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {losslessJoin.missingTupleCount}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reconstructed Table Preview ({losslessJoin.reconstructedRows.length} tuples):
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                    <th className="px-3 py-2 text-center text-slate-400">#</th>
                    {originalTable.columns.map((c) => (
                      <th key={c.name} className="px-3 py-2 font-mono font-semibold">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {losslessJoin.reconstructedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-1 font-mono text-center text-slate-400">{idx + 1}</td>
                      {originalTable.columns.map((c) => (
                        <td key={c.name} className="px-3 py-1 font-mono text-slate-800 dark:text-slate-200">
                          {row[c.name] !== undefined ? String(row[c.name]) : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Export SQL*Plus Script */}
      {activeTab === 'sql' && (
        <div className="card-padded space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Generated SQL*Plus Script
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Executable Oracle SQL*Plus DDL & DML script containing the normalized tables and populated tuples.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="btn btn-secondary text-xs"
              >
                {copied ? '✓ Copied' : 'Copy Script'}
              </button>
              <button
                type="button"
                onClick={handleDownloadSql}
                className="btn btn-primary text-xs"
              >
                📥 Download .sql File
              </button>
            </div>
          </div>

          <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-emerald-400 leading-relaxed">
            {sqlScript}
          </pre>
        </div>
      )}
    </div>
  );
}
