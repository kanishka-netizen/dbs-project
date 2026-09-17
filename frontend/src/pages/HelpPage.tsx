import { Link } from 'react-router-dom';

import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { SCHEMA_EXAMPLES } from '../features/normalization/schema-examples';

export function HelpPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Help"
        subtitle="How to describe a schema, and how to read the results."
        ownedBy="Team 2 — TripleX"
      />

      <div className="space-y-6">
        <section className="card-padded">
          <h2 className="section-title">Writing a schema</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The first line lists the relation&rsquo;s attributes. Every line
            after it is one dependency.
          </p>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-100">
            {`attributes: StudentID, CourseID, CourseName

StudentID, CourseID -> CourseName
CourseID ->> CourseName`}
          </pre>

          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <code className="font-mono">-&gt;</code> is a functional
              dependency: <code className="font-mono">A -&gt; B</code>.
            </li>
            <li>
              <code className="font-mono">-&gt;&gt;</code> is a multivalued
              dependency, needed for 4NF and 5NF:{' '}
              <code className="font-mono">A -&gt;&gt; B</code>.
            </li>
            <li>
              The unicode arrows <code className="font-mono">→</code> and{' '}
              <code className="font-mono">↠</code> work too, if you paste them.
            </li>
            <li>
              Multiple attributes on one side are comma separated:{' '}
              <code className="font-mono">A, B -&gt; C, D</code>.
            </li>
            <li>
              Lines starting with <code className="font-mono">#</code>,{' '}
              <code className="font-mono">--</code> or{' '}
              <code className="font-mono">//</code> are comments.
            </li>
          </ul>
        </section>

        <section className="card-padded">
          <h2 className="section-title">Reading the results</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-900 dark:text-white">
                Candidate keys
              </dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">
                Minimal sets of attributes that determine every other
                attribute. A relation can have more than one.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 dark:text-white">
                Prime and non-prime attributes
              </dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">
                An attribute is prime if it belongs to at least one candidate
                key. The 3NF test depends on this distinction.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 dark:text-white">
                Highest normal form
              </dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">
                The strongest form the relation satisfies. Normal forms are
                nested: 3NF implies 2NF implies 1NF, so the highest form is the
                last one in the chain with no violation.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 dark:text-white">
                Decomposition
              </dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">
                The relations the schema becomes. A good decomposition is
                lossless — joining the pieces back always reproduces the
                original relation — and ideally dependency preserving.
              </dd>
            </div>
          </dl>
        </section>

        <section className="card-padded">
          <h2 className="section-title">Example schemas</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Load any of these on the visualizer page to see how each normal form
            fails.
          </p>

          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {SCHEMA_EXAMPLES.map((example) => (
              <li key={example.id} className="py-3">
                <p className="font-medium text-slate-900 dark:text-white">
                  {example.label}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {example.demonstrates}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-padded">
          <h2 className="section-title">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            If the visualizer reports that it cannot reach the analysis service,
            the backend is not running. Start it from the repository root with
            <code className="mx-1 font-mono">npm run dev</code>— the API listens
            on port 3001.
          </p>

          <Link to="/visualizer" className="btn-primary mt-4">
            Back to the visualizer
          </Link>
        </section>
      </div>
    </PageContainer>
  );
}
