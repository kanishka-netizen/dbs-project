import { useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  parseCreateTable,
  parseCsv,
} from './schema-import';
import type { AnalyzeNormalizationRequest } from '../../types/normalization';
import { SCHEMA_EXAMPLES } from './schema-examples';
import { parseSchema, type ParseIssue } from './schema-text';

const DEFAULT_EXAMPLE = SCHEMA_EXAMPLES[0];

/**
 * Schema entry form.
 *
 * Shared by all three teams: Team 1 adds 1NF–4NF specific hints, Team 2 owns
 * the layout, Team 3 reuses the parser for the automatic assistant.
 */
export function SchemaInput({
  onSubmit,
  isAnalyzing,
}: {
  onSubmit: (request: AnalyzeNormalizationRequest) => void;
  isAnalyzing: boolean;
}) {
  const [relationName, setRelationName] = useState(
    DEFAULT_EXAMPLE.relationName,
  );
  const [schemaText, setSchemaText] = useState(DEFAULT_EXAMPLE.schemaText);
  const [issues, setIssues] = useState<ParseIssue[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const relationId = useId();
  const schemaId = useId();

  function applyImportedSchema(
    attributes: string[],
    functionalDependencies: AnalyzeNormalizationRequest['functionalDependencies'],
    multivaluedDependencies: NonNullable<
      AnalyzeNormalizationRequest['multivaluedDependencies']
    >,
  ) {
    setSchemaText(
      [
        attributes.join(', '),
        ...functionalDependencies.map(
          (fd) => `${fd.left.join(', ')} -> ${fd.right.join(', ')}`,
        ),
        ...multivaluedDependencies.map(
          (mvd) => `${mvd.left.join(', ')} ->> ${mvd.right.join(', ')}`,
        ),
      ].join('\n'),
    );

    setIssues([]);
  }

  function handleCreateTableImport() {
    const sql = window.prompt('Paste your CREATE TABLE statement:');

    if (!sql) {
      return;
    }

    const result = parseCreateTable(sql);

    if (result.issues.length > 0 || result.schema.attributes.length === 0) {
      setIssues(
        result.issues.map((issue) => ({
          line: 1,
          message: issue.message,
        })),
      );
      return;
    }

    setRelationName('R');

    applyImportedSchema(
      result.schema.attributes,
      result.schema.functionalDependencies,
      result.schema.multivaluedDependencies,
    );
  }

  function handleCsvClick() {
    fileInputRef.current?.click();
  }

  function handleCsvChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? '');
      const result = parseCsv(text);

      if (
        result.issues.length > 0 ||
        result.schema.attributes.length === 0
      ) {
        setIssues(
          result.issues.map((issue) => ({
            line: 1,
            message: issue.message,
          })),
        );
        return;
      }

      setRelationName(file.name.replace(/\.csv$/i, '') || 'R');

      applyImportedSchema(
        result.schema.attributes,
        result.schema.functionalDependencies,
        result.schema.multivaluedDependencies,
      );
    };

    reader.readAsText(file);

    // Allow selecting the same file again later.
    event.target.value = '';
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { schema, issues: parseIssues } = parseSchema(schemaText);

    if (parseIssues.length > 0 || schema.attributes.length === 0) {
      setIssues(parseIssues);
      return;
    }

    setIssues([]);

    onSubmit({
      relationName: relationName.trim() || 'R',
      attributes: schema.attributes,
      functionalDependencies: schema.functionalDependencies,
      multivaluedDependencies: schema.multivaluedDependencies,
    });
  }

  function loadExample(id: string) {
    const example = SCHEMA_EXAMPLES.find((item) => item.id === id);

    if (!example) {
      return;
    }

    setRelationName(example.relationName);
    setSchemaText(example.schemaText);
    setIssues([]);
  }

  return (
    <form
      id="schema-input"
      onSubmit={handleSubmit}
      className="card-padded"
    >
      <div className="grid gap-4">
        <div>
          <label htmlFor={relationId} className="label">
            Relation name
          </label>

          <input
            id={relationId}
            className="input"
            value={relationName}
            onChange={(event) => setRelationName(event.target.value)}
            placeholder="R"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor={schemaId} className="label">
            Schema
          </label>

          <textarea
            id={schemaId}
            className="input min-h-56 font-mono text-sm"
            value={schemaText}
            onChange={(event) => setSchemaText(event.target.value)}
            spellCheck={false}
            aria-describedby={`${schemaId}-hint`}
          />

          <p
            id={`${schemaId}-hint`}
            className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            First line lists the attributes. Then one dependency per line:
            <code className="mx-1 font-mono">A, B -&gt; C</code> for a
            functional dependency,
            <code className="mx-1 font-mono">A -&gt;&gt; B</code> for a
            multivalued dependency.
          </p>
        </div>

        {issues.length > 0 && (
          <ul className="notice-error space-y-1">
            {issues.map((issue) => (
              <li key={`${issue.line}-${issue.message}`}>
                <span className="font-mono">Line {issue.line}:</span>{' '}
                {issue.message}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCreateTableImport}
          >
            Import CREATE TABLE
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleCsvClick}
          >
            Import CSV
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvChange}
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analysing…' : 'Analyse schema'}
          </button>

          <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
            Examples:
          </span>

          {SCHEMA_EXAMPLES.map((example) => (
            <button
              key={example.id}
              type="button"
              className="btn-secondary px-2.5 py-1 text-xs"
              onClick={() => loadExample(example.id)}
              title={example.demonstrates}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}