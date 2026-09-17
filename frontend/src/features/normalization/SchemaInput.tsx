import { useId, useState } from 'react';
import type { FormEvent } from 'react';

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

  const relationId = useId();
  const schemaId = useId();

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
    <form onSubmit={handleSubmit} className="card-padded">
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
          <button type="submit" className="btn-primary" disabled={isAnalyzing}>
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
