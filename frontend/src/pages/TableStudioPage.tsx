import { useState, useTransition } from 'react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { AnalysisSkeleton } from '../components/common/AnalysisSkeleton';
import { ErrorNotice } from '../components/common/ErrorNotice';
import { NormalFormStrip } from '../features/normalization/NormalFormStrip';
import { ViolationList } from '../features/normalization/ViolationList';
import { orderedVerdicts } from '../types/normalization';
import type { NormalizationResponse } from '../types/normalization';
import { analyzeNormalization } from '../lib/api';

import type {
  CellViolation1NF,
  DecomposedTable,
  DiscoveredFD,
  LosslessJoinResult,
  TableInstance,
} from '../features/table-analysis/table-types';
import { LAB_PRESETS } from '../features/table-analysis/lab-presets';
import { TableDataGrid } from '../features/table-analysis/TableDataGrid';
import { SqlPlusConsole } from '../features/table-analysis/SqlPlusConsole';
import { TableImportPanel } from '../features/table-analysis/TableImportPanel';
import { DiscoveredFdsPanel } from '../features/table-analysis/DiscoveredFdsPanel';
import { DecomposedTablesView } from '../features/table-analysis/DecomposedTablesView';
import {
  check1NFAtomicity,
  checkFunctionalDependency,
  discoverCandidateKeys,
  discoverFunctionalDependencies,
} from '../features/table-analysis/fd-discovery';
import {
  projectRelation,
  verifyLosslessJoinOnData,
} from '../features/table-analysis/table-normalizer';
import { parseSqlPlusScript } from '../features/table-analysis/sql-plus-parser';

export function TableStudioPage() {
  // Initialize with the 3NF lab preset
  const defaultPreset = LAB_PRESETS[0];
  const initialParse = parseSqlPlusScript(defaultPreset.sql);
  const initialTable = initialParse.tables[0];

  const [table, setTable] = useState<TableInstance>(initialTable);
  const [activeInputTab, setActiveInputTab] = useState<'none' | 'file' | 'sql' | 'presets'>('none');
  const [highlightedRows, setHighlightedRows] = useState<[number, number] | undefined>(undefined);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [atomicityResult, setAtomicityResult] = useState<{
    is1NF: boolean;
    violations: CellViolation1NF[];
  } | null>(null);
  const [discoveredFds, setDiscoveredFds] = useState<DiscoveredFD[]>([]);
  const [selectedFds, setSelectedFds] = useState<DiscoveredFD[]>([]);
  const [candidateKeys, setCandidateKeys] = useState<string[][]>([]);
  const [normalizationResponse, setNormalizationResponse] = useState<NormalizationResponse | null>(null);
  const [decomposedTables, setDecomposedTables] = useState<DecomposedTable[]>([]);
  const [losslessResult, setLosslessResult] = useState<LosslessJoinResult | null>(null);

  const [, startTransition] = useTransition();

  // Reset analysis when table data changes
  function handleTableChange(updatedTable: TableInstance) {
    setTable(updatedTable);
    setAtomicityResult(null);
    setNormalizationResponse(null);
    setDecomposedTables([]);
    setLosslessResult(null);
    setHighlightedRows(undefined);
  }

  function handleLoadPreset(presetId: string) {
    const preset = LAB_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const res = parseSqlPlusScript(preset.sql);
    if (res.tables.length > 0) {
      handleTableChange(res.tables[0]);
      setActiveInputTab('none');
    }
  }

  async function handleRunAnalysis() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setHighlightedRows(undefined);

    const colNames = table.columns.map((c) => c.name);

    // 1. Check 1NF cell atomicity
    const atomicity = check1NFAtomicity(table.rows, colNames);
    setAtomicityResult(atomicity);

    // 2. Discover FDs and Candidate Keys from Data
    const fds = discoverFunctionalDependencies(table.rows, colNames, 2);
    setDiscoveredFds(fds);

    // Select all valid holding FDs by default
    const validFds = fds.filter((fd) => fd.holds);
    setSelectedFds(validFds);

    const keys = discoverCandidateKeys(table.rows, colNames, 3);
    setCandidateKeys(keys);

    // 3. Call backend normalization pipeline
    try {
      const response = await analyzeNormalization({
        relationName: table.name,
        attributes: colNames,
        functionalDependencies: validFds.map((f) => ({
          left: f.left,
          right: f.right,
        })),
      });

      startTransition(() => {
        setNormalizationResponse(response);

        // 4. Project actual table data onto decomposed relations
        if (response.valid) {
          // If decomposition returned by backend, use it; otherwise use single table or bcnf
          const targetRelations: { name: string; attributes: string[]; reason?: string }[] =
            response.decomposition.length > 0
              ? response.decomposition
              : response.bcnfDecomposition.length > 0
                ? response.bcnfDecomposition
                : [{ name: table.name, attributes: colNames, reason: 'Original relation' }];

          const projectedDecomposed: DecomposedTable[] = targetRelations.map((rel) => {
            const projectedRows = projectRelation(table.rows, rel.attributes);
            return {
              name: rel.name,
              attributes: rel.attributes,
              rows: projectedRows,
              reason: rel.reason,
            };
          });

          setDecomposedTables(projectedDecomposed);

          // 5. Verify Lossless Join on real data
          const joinResult = verifyLosslessJoinOnData(table, projectedDecomposed);
          setLosslessResult(joinResult);
        }
      });
    } catch (err) {
      setAnalysisError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Toggle FD inclusion
  async function handleToggleFd(toggled: DiscoveredFD) {
    const isAlreadySelected = selectedFds.some(
      (f) =>
        f.left.join(',') === toggled.left.join(',') &&
        f.right.join(',') === toggled.right.join(','),
    );

    const updated = isAlreadySelected
      ? selectedFds.filter(
          (f) =>
            f.left.join(',') !== toggled.left.join(',') ||
            f.right.join(',') !== toggled.right.join(','),
        )
      : [...selectedFds, toggled];

    setSelectedFds(updated);

    // Re-run backend analysis with updated FD set
    const colNames = table.columns.map((c) => c.name);
    try {
      const response = await analyzeNormalization({
        relationName: table.name,
        attributes: colNames,
        functionalDependencies: updated.map((f) => ({
          left: f.left,
          right: f.right,
        })),
      });

      setNormalizationResponse(response);

      if (response.valid) {
        const targetRelations: { name: string; attributes: string[]; reason?: string }[] =
          response.decomposition.length > 0
            ? response.decomposition
            : response.bcnfDecomposition.length > 0
              ? response.bcnfDecomposition
              : [{ name: table.name, attributes: colNames, reason: 'Original relation' }];

        const projectedDecomposed: DecomposedTable[] = targetRelations.map((rel) => ({
          name: rel.name,
          attributes: rel.attributes,
          rows: projectRelation(table.rows, rel.attributes),
          reason: rel.reason,
        }));

        setDecomposedTables(projectedDecomposed);
        setLosslessResult(verifyLosslessJoinOnData(table, projectedDecomposed));
      }
    } catch (err) {
      setAnalysisError((err as Error).message);
    }
  }

  // Test custom FD
  function handleVerifyCustomFd(left: string[], right: string[]) {
    const result = checkFunctionalDependency(table.rows, left, right);
    setDiscoveredFds((prev) => [result, ...prev]);
    if (result.holds) {
      setSelectedFds((prev) => [...prev, result]);
    } else if (result.conflictingRows) {
      setHighlightedRows(result.conflictingRows);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Relational Table Studio"
        subtitle="Import tables from your device, execute SQL*Plus scripts, discover functional dependencies from actual data, and inspect projected normalized tables."
        ownedBy="Team 1 · Team 2 · Team 3"
      />

      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="card-padded flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Active Table: <span className="font-mono text-purple-600 dark:text-purple-400">{table.name}</span>
            </h2>
            <span className="chip-neutral text-xs">
              {table.rows.length} rows · {table.columns.length} columns
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveInputTab((prev) => (prev === 'file' ? 'none' : 'file'))
              }
              className={`btn text-xs ${
                activeInputTab === 'file' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              📁 Import from Device
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveInputTab((prev) => (prev === 'sql' ? 'none' : 'sql'))
              }
              className={`btn text-xs ${
                activeInputTab === 'sql' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              💻 SQL*Plus Console
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveInputTab((prev) => (prev === 'presets' ? 'none' : 'presets'))
              }
              className={`btn text-xs ${
                activeInputTab === 'presets' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              🧪 Lab Presets
            </button>

            <button
              type="button"
              disabled={isAnalyzing || table.rows.length === 0}
              onClick={handleRunAnalysis}
              className="btn btn-primary text-xs font-bold shadow-sm"
            >
              {isAnalyzing ? 'Analyzing Table...' : '🚀 Analyse Table Data'}
            </button>
          </div>
        </div>

        {/* Input Drawers */}
        {activeInputTab === 'file' && (
          <div className="animate-reveal">
            <TableImportPanel
              onTableImported={(imported) => {
                handleTableChange(imported);
                setActiveInputTab('none');
              }}
            />
          </div>
        )}

        {activeInputTab === 'sql' && (
          <div className="animate-reveal">
            <SqlPlusConsole
              onTableCreated={(created) => {
                handleTableChange(created);
                setActiveInputTab('none');
              }}
            />
          </div>
        )}

        {activeInputTab === 'presets' && (
          <div className="card-padded animate-reveal">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Select a Database Lab Preset:
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Preloaded database tables with specific real-world anomalies:
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LAB_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset.id)}
                  className="rounded-lg border border-slate-200 p-3 text-left transition hover:border-purple-400 hover:bg-purple-50/30 dark:border-slate-800 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {preset.tableName}
                    </span>
                    <span className="chip-brand text-[10px] font-bold">
                      {preset.category}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                    {preset.title}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Data Grid */}
        <section aria-labelledby="data-grid-heading">
          <h2 id="data-grid-heading" className="sr-only">
            Table Data
          </h2>
          <TableDataGrid
            table={table}
            onTableChange={handleTableChange}
            cellViolations={atomicityResult?.violations || []}
            highlightedRowIndices={highlightedRows}
          />
        </section>

        {/* Loading Skeleton */}
        {isAnalyzing && <AnalysisSkeleton />}

        {/* Error Notice */}
        {analysisError && (
          <ErrorNotice
            message={analysisError}
            onRetry={handleRunAnalysis}
          />
        )}

        {/* 1NF Cell Atomicity Report */}
        {atomicityResult && (
          <section className="card-padded">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                1NF Cell Atomicity Check (Real Data Tuples)
              </h3>
              {atomicityResult.is1NF ? (
                <span className="chip-success text-xs font-bold">
                  ✓ Satisfies 1NF (All Cells Atomic)
                </span>
              ) : (
                <span className="chip-danger text-xs font-bold">
                  ⚠️ 1NF Violated ({atomicityResult.violations.length} non-atomic cell{atomicityResult.violations.length === 1 ? '' : 's'})
                </span>
              )}
            </div>

            {atomicityResult.is1NF ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Every cell in this table contains an indivisible, single scalar value. No comma-separated lists or repeating groups were detected.
              </p>
            ) : (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  The following cells contain composite or multi-valued lists (highlighted in red in the table above). First Normal Form requires atomicity:
                </p>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  {atomicityResult.violations.map((v, i) => (
                    <div key={i} className="p-2.5 text-xs bg-red-50/40 dark:bg-red-950/20">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-red-700 dark:text-red-400">
                          Row {v.rowIndex + 1}, Column '{v.column}':
                        </span>
                        <span className="rounded bg-red-200/80 dark:bg-red-900/60 px-1.5 py-0.5">
                          "{v.value}"
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                        Suggested atomic values: {v.suggestedValues.map((s) => `'${s}'`).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Discovered FDs & Candidate Keys */}
        {discoveredFds.length > 0 && (
          <DiscoveredFdsPanel
            discoveredFds={discoveredFds}
            candidateKeys={candidateKeys}
            selectedFds={selectedFds}
            onToggleFd={handleToggleFd}
            onSelectConflict={(rows) => setHighlightedRows(rows)}
            onVerifyCustomFd={handleVerifyCustomFd}
            allColumns={table.columns.map((c) => c.name)}
          />
        )}

        {/* Normalization Verdicts & Decomposed Tables */}
        {normalizationResponse && normalizationResponse.valid && (
          <div className="space-y-6">
            <section className="card-padded">
              <h3 className="section-title mb-4">
                Normal Form Coverage for Table "{table.name}"
              </h3>
              <NormalFormStrip
                verdicts={orderedVerdicts(normalizationResponse)}
                highestNormalForm={normalizationResponse.highestNormalForm}
              />
            </section>

            <section className="card-padded">
              <h3 className="section-title mb-3">
                Why Normal Forms Failed
              </h3>
              <ViolationList
                violations={normalizationResponse.violations}
                emptyMessage="No functional dependencies violate 2NF, 3NF, or BCNF."
              />
            </section>

            {/* Decomposed Tables with Real Projected Data */}
            {decomposedTables.length > 0 && losslessResult && (
              <DecomposedTablesView
                originalTable={table}
                decomposedTables={decomposedTables}
                losslessJoin={losslessResult}
              />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
