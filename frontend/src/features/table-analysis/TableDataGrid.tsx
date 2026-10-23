import { useState } from 'react';
import type { CellViolation1NF, TableInstance, TableRow } from './table-types';

interface TableDataGridProps {
  table: TableInstance;
  onTableChange?: (updated: TableInstance) => void;
  cellViolations?: CellViolation1NF[];
  highlightedRowIndices?: [number, number];
  readOnly?: boolean;
}

export function TableDataGrid({
  table,
  onTableChange,
  cellViolations = [],
  highlightedRowIndices,
  readOnly = false,
}: TableDataGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowData, setNewRowData] = useState<TableRow>({});

  const colNames = table.columns.map((c) => c.name);

  // Filter rows by search
  const filteredRows = table.rows
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => {
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      return colNames.some((c) => String(row[c] || '').toLowerCase().includes(lower));
    });

  function handleDeleteRow(origIndex: number) {
    if (!onTableChange) return;
    const updatedRows = table.rows.filter((_, idx) => idx !== origIndex);
    onTableChange({ ...table, rows: updatedRows });
  }

  function handleAddRowSubmit() {
    if (!onTableChange) return;
    const filledRow: TableRow = {};
    colNames.forEach((c) => {
      const val = newRowData[c];
      filledRow[c] = val !== undefined ? val : '';
    });

    onTableChange({
      ...table,
      rows: [...table.rows, filledRow],
    });

    setNewRowData({});
    setIsAddingRow(false);
  }

  function isCellViolated(rowIndex: number, colName: string): CellViolation1NF | undefined {
    return cellViolations.find((v) => v.rowIndex === rowIndex && v.column === colName);
  }

  return (
    <div className="card overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
            {table.name}
          </span>
          <span className="chip-neutral text-xs">
            {table.rows.length} {table.rows.length === 1 ? 'row' : 'rows'}
          </span>
          <span className="chip-neutral text-xs">
            {table.columns.length} {table.columns.length === 1 ? 'column' : 'columns'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search rows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input max-w-xs py-1 text-xs"
          />

          {!readOnly && onTableChange && (
            <button
              type="button"
              onClick={() => setIsAddingRow((prev) => !prev)}
              className="btn btn-secondary py-1 text-xs"
            >
              {isAddingRow ? 'Cancel' : '+ Add Row'}
            </button>
          )}
        </div>
      </div>

      {/* Add Row Inline Form */}
      {isAddingRow && !readOnly && (
        <div className="border-b border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/40 dark:bg-purple-950/20">
          <div className="mb-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
            Insert New Tuple:
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {table.columns.map((col) => (
              <div key={col.name}>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  {col.name}
                </label>
                <input
                  type="text"
                  placeholder={col.type || 'text'}
                  value={newRowData[col.name] !== undefined ? String(newRowData[col.name]) : ''}
                  onChange={(e) =>
                    setNewRowData({ ...newRowData, [col.name]: e.target.value })
                  }
                  className="input mt-0.5 py-1 text-xs"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingRow(false)}
              className="btn btn-secondary py-1 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddRowSubmit}
              className="btn btn-primary py-1 text-xs"
            >
              Insert Tuple
            </button>
          </div>
        </div>
      )}

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <th className="w-12 px-3 py-2.5 font-mono text-center text-slate-400">#</th>
              {table.columns.map((col) => (
                <th key={col.name} className="px-4 py-2.5 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-900 dark:text-white">
                      {col.name}
                    </span>
                    {col.isPrimaryKey && (
                      <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        PK
                      </span>
                    )}
                  </div>
                  {col.type && (
                    <span className="block font-mono text-[10px] font-normal text-slate-500 dark:text-slate-400">
                      {col.type}
                    </span>
                  )}
                </th>
              ))}
              {!readOnly && onTableChange && <th className="w-16 px-3 py-2.5 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={colNames.length + (readOnly ? 1 : 2)}
                  className="py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  No rows found.
                </td>
              </tr>
            ) : (
              filteredRows.map(({ row, originalIndex }) => {
                const isConflictHighlight =
                  highlightedRowIndices &&
                  (highlightedRowIndices[0] === originalIndex ||
                    highlightedRowIndices[1] === originalIndex);

                return (
                  <tr
                    key={originalIndex}
                    className={`transition-colors ${
                      isConflictHighlight
                        ? 'bg-amber-100/70 dark:bg-amber-950/40 ring-1 ring-inset ring-amber-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-center text-slate-400">
                      {originalIndex + 1}
                    </td>

                    {colNames.map((col) => {
                      const violation = isCellViolated(originalIndex, col);
                      const val = row[col];

                      return (
                        <td
                          key={col}
                          className={`px-4 py-2 font-mono ${
                            violation
                              ? 'bg-red-100/80 text-red-900 font-semibold dark:bg-red-950/50 dark:text-red-200'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                          title={violation?.reason}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{val !== undefined && val !== '' ? String(val) : 'NULL'}</span>
                            {violation && (
                              <span
                                className="inline-block rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-bold text-white"
                                title={violation.reason}
                              >
                                ! 1NF
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {!readOnly && onTableChange && (
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(originalIndex)}
                          className="text-slate-400 hover:text-red-600 transition"
                          title="Delete row"
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
