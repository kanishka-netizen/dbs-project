import type { NormalizationResponse } from '../../types/normalization';

export interface ColumnDefinition {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
}

export type TableRow = Record<string, string | number>;

export interface TableInstance {
  name: string;
  columns: ColumnDefinition[];
  rows: TableRow[];
}

export interface CellViolation1NF {
  rowIndex: number;
  column: string;
  value: string;
  reason: string;
  suggestedValues: string[];
}

export interface DiscoveredFD {
  left: string[];
  right: string[];
  holds: boolean;
  conflictingRows?: [number, number]; // 0-based indices of conflicting rows
  conflictExplanation?: string;
}

export interface DecomposedTable {
  name: string;
  attributes: string[];
  primaryKey?: string[];
  rows: TableRow[];
  reason?: string;
}

export interface LosslessJoinResult {
  isLossless: boolean;
  originalRowCount: number;
  reconstructedRowCount: number;
  reconstructedRows: TableRow[];
  spuriousTupleCount: number;
  missingTupleCount: number;
}

export interface TableAnalysisResult {
  table: TableInstance;
  atomicity1NF: {
    is1NF: boolean;
    violations: CellViolation1NF[];
  };
  discoveredFDs: DiscoveredFD[];
  candidateKeys: string[][];
  normalizationResponse?: NormalizationResponse;
  decomposedTables: DecomposedTable[];
  losslessJoin: LosslessJoinResult;
}

export interface LabPreset {
  id: string;
  title: string;
  category: '1NF' | '2NF' | '3NF' | 'BCNF' | '4NF';
  description: string;
  tableName: string;
  sql: string;
}
