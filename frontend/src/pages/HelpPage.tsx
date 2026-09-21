import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { FAQ } from '../features/learn/faq';
import { GLOSSARY } from '../features/learn/glossary';
import { SCHEMA_EXAMPLES } from '../features/normalization/schema-examples';

const SECTIONS = [
  { id: 'writing-a-schema', label: 'Writing a schema' },
  { id: 'walkthrough', label: 'Worked walkthrough' },
  { id: 'reading-results', label: 'Reading the results' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'faq', label: 'FAQ' },
  { id: 'examples', label: 'Example schemas' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
];

export function HelpPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Help"
        subtitle="How to describe a schema, how to read the results, and what the vocabulary means."
        ownedBy="Team 2 — TripleX"
      />

      <nav aria-label="Jump to a section" className="no-print mb-8">
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        <WritingASchema />
        <Walkthrough />
        <ReadingResults />
        <Glossary />
        <Faq />
        <Examples />
        <Troubleshooting />
      </div>
    </PageContainer>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="card-padded scroll-mt-20">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}

function WritingASchema() {
  return (
    <Section id="writing-a-schema" title="Writing a schema">
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The first line lists the relation&rsquo;s attributes. Every line after
        it is one dependency.
      </p>

      <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-100">
        {`attributes: StudentID, CourseID, CourseName

StudentID, CourseID -> CourseName
CourseID ->> CourseName`}
      </pre>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
        <li>
          <code className="font-mono">-&gt;</code> is a functional dependency:{' '}
          <code className="font-mono">A -&gt; B</code>.
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
        <li>
          Omit the attribute line entirely and the analyser takes every
          attribute named in a dependency.
        </li>
      </ul>
    </Section>
  );
}

const WALKTHROUGH_STEPS = [
  {
    title: 'Find the candidate keys',
    detail:
      'Both {Student, Course} and {Student, Instructor} determine every other attribute, and neither contains the other, so both are minimal. The relation has two candidate keys.',
  },
  {
    title: 'Check 2NF',
    detail:
      'The only candidate keys are two attributes each, and no non-prime attribute depends on a proper subset of either. 2NF holds.',
  },
  {
    title: 'Check 3NF',
    detail:
      'Instructor → Course has a determinant that is not a superkey — but Course is prime, because it belongs to {Student, Course}. 3NF tolerates that, so 3NF holds.',
  },
  {
    title: 'Check BCNF',
    detail:
      'BCNF removes that escape hatch. Instructor is still not a superkey, so Instructor → Course breaks BCNF. This is the case where 3NF and BCNF disagree.',
  },
  {
    title: 'Decompose',
    detail:
      'Split on Instructor → Course into X ∪ Y = {Instructor, Course} and R − (Y − X) = {Student, Instructor}. Both pieces are in BCNF, and rejoining them on Instructor reproduces the original — lossless, though the dependency is no longer checkable without a join.',
  },
];

function Walkthrough() {
  return (
    <Section id="walkthrough" title="Worked walkthrough">
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The clearest way to see the 3NF/BCNF distinction. Paste this into the
        visualizer and follow along.
      </p>

      <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-100">
        {`attributes: Student, Course, Instructor

Student, Course -> Instructor
Instructor -> Course`}
      </pre>

      <ol className="mt-5 space-y-4">
        {WALKTHROUGH_STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 font-mono text-xs font-bold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="notice-warn mt-5">
        The outcome to remember: this relation is in 3NF but not BCNF, and
        reaching BCNF costs the ability to check <code>Instructor → Course</code>{' '}
        without a join. That trade-off is the reason 3NF is often the practical
        stopping point.
      </p>
    </Section>
  );
}

function ReadingResults() {
  return (
    <Section id="reading-results" title="Reading the results">
      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            Normal form coverage
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            One badge per form from 1NF to 5NF. The form marked
            &ldquo;Highest&rdquo; is the strongest the relation satisfies. Forms
            above it are marked violated, not merely unchecked.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            Candidate keys
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            Minimal sets of attributes that determine every other attribute. A
            relation can have more than one, and that is usually where 2NF
            surprises people.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            Primary and non-prime attributes
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            An attribute is prime if it belongs to at least one candidate key.
            The 3NF test turns entirely on this distinction.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            BCNF decomposition
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            Each split is shown with the dependency that drove it, followed by
            whether the result is lossless and which dependencies it failed to
            preserve.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            Decomposition
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            The relations the schema becomes. A good decomposition is lossless —
            joining the pieces back always reproduces the original relation —
            and ideally dependency preserving.
          </dd>
        </div>
      </dl>
    </Section>
  );
}

function Glossary() {
  return (
    <Section id="glossary" title="Glossary">
      <dl className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
        {GLOSSARY.map((entry) => (
          <div key={entry.term} className="py-3">
            <dt className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
              {entry.term}
            </dt>
            <dd className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {entry.definition}
              {entry.inThisApp && (
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-500">
                  {entry.inThisApp}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Faq() {
  return (
    <Section id="faq" title="Frequently asked questions">
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Mostly questions the tool provokes by looking wrong when it is in fact
        right.
      </p>

      <div className="mt-4 space-y-2">
        {FAQ.map((entry) => (
          <details
            key={entry.question}
            className="rounded-lg border border-slate-200 dark:border-slate-800"
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
              {entry.question}
            </summary>
            <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
              {entry.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Examples() {
  return (
    <Section id="examples" title="Example schemas">
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
    </Section>
  );
}

function Troubleshooting() {
  return (
    <Section id="troubleshooting" title="Something went wrong">
      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            &ldquo;Could not reach the analysis service&rdquo;
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            The backend is not running. Start both halves from the repository
            root with <code className="font-mono">npm run dev</code> — the API
            listens on port 3001, the interface on 3000. Use the{' '}
            <span className="font-medium">Try again</span> button once it is up.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            4NF and 5NF always say &ldquo;Satisfied&rdquo;
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            No multivalued dependencies were declared. Those two forms are about
            MVDs, and functional dependencies cannot stand in for them — use{' '}
            <code className="font-mono">-&gt;&gt;</code>.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900 dark:text-white">
            A line of my schema was ignored
          </dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            It was a trivial dependency: <code className="font-mono">X ↠ Y</code>{' '}
            where <code className="font-mono">X ∪ Y</code> is the whole
            relation, or <code className="font-mono">X → Y</code> where Y is
            already inside X.
          </dd>
        </div>
      </dl>

      <Link to="/visualizer" className="btn-primary mt-5">
        Back to the visualizer
      </Link>
    </Section>
  );
}
