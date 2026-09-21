import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { NORMAL_FORM_CONTENT } from '../features/learn/normal-form-content';

export function LearnPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Learn the normal forms"
        subtitle="Each normal form, what breaks it, and how to repair it — with a worked example."
        ownedBy="Team 1 — TLE"
      />

      <nav aria-label="Jump to a normal form" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {NORMAL_FORM_CONTENT.map((content) => (
            <li key={content.normalForm}>
              <a
                href={`#${content.normalForm}`}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                {content.normalForm}
              </a>
            </li>
          ))}
          <li>
  <a
    href="#video"
    className="btn-secondary px-3 py-1.5 text-xs"
  >
    Video
  </a>
</li>

<li>
  <a
    href="#references"
    className="btn-secondary px-3 py-1.5 text-xs"
  >
    References
  </a>
</li>
        </ul>
      </nav>

      <div className="space-y-6">
        {NORMAL_FORM_CONTENT.map((content) => (
          <article
            key={content.normalForm}
            id={content.normalForm}
            className="card-padded scroll-mt-20"
          >
            <header className="mb-4">
              <span className="badge-info mb-2">{content.normalForm}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {content.tagline}
              </h2>
            </header>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  Definition
                </dt>
                <dd className="mt-1 text-slate-600 dark:text-slate-400">
                  {content.definition}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  In plain terms
                </dt>
                <dd className="mt-1 text-slate-600 dark:text-slate-400">
                  {content.plainEnglish}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  What breaks it
                </dt>
                <dd className="mt-1 text-slate-600 dark:text-slate-400">
                  {content.violation}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  How to fix it
                </dt>
                <dd className="mt-1 text-slate-600 dark:text-slate-400">
                  {content.fix}
                </dd>
              </div>
            </dl>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-danger-500/40 bg-danger-500/5 p-4">
                <p className="mb-2 text-xs font-semibold tracking-wide text-danger-600 uppercase dark:text-danger-500">
                  Before
                </p>
                <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                  {content.example.before}
                </pre>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {content.example.beforeProblem}
                </p>
              </div>

              <div className="rounded-lg border border-ok-500/40 bg-ok-500/5 p-4">
                <p className="mb-2 text-xs font-semibold tracking-wide text-ok-600 uppercase dark:text-ok-500">
                  After
                </p>
                <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                  {content.example.after}
                </pre>
              </div>
            </div>

            <details className="mt-5">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
                Common mistakes
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
                {content.commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>

      {/* Normalization Video */}
      <section
        id="video"
        className="card-padded mt-6 scroll-mt-20"
      >
        <header className="mb-5">
          <span className="badge-info mb-2">Video</span>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Database Normalization Explained
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Watch this visual explanation of database normalization covering
            1NF, 2NF, 3NF, BCNF, 4NF and 5NF.
          </p>
        </header>

        <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/GFQaEYEc8_8"
            title="Learn Database Normalization - 1NF, 2NF, 3NF, 4NF, 5NF"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
          Video: Decomplexify — Learn Database Normalization.
        </p>
      </section>

      {/* References */}
      <section
        id="references"
        className="card-padded mt-6 scroll-mt-20"
      >
        <header className="mb-5">
          <span className="badge-info mb-2">References</span>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            References and Learning Resources
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Textbooks and resources referred to while developing the
            normalization concepts and explanations.
          </p>
        </header>

        <div className="space-y-5 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Text Book
            </h3>

            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                R. Elmasri and S. B. Navathe,{' '}
                <span className="italic">
                  Fundamentals of Database Systems
                </span>
                , Pearson India Education, 7th Edition, 2021.
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Reference Books
            </h3>

            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                A. Silberschatz, H. F. Korth and S. Sudarshan,{' '}
                <span className="italic">
                  Database System Concepts
                </span>
                , McGraw Hill India, 7th Edition, 2021.
              </li>

              <li>
                Mark L. Gillenson and Pradeep Singh,{' '}
                <span className="italic">
                  Fundamentals of Database Management Systems – An Indian
                  Adaptation
                </span>
                , Wiley, India, 3rd Edition, 2025.
              </li>

              <li>
                M. Tamer Özsu and Patrick Valduriez,{' '}
                <span className="italic">
                  Principles of Distributed Database Systems
                </span>
                , Springer Nature, 4th Edition, 2020.
              </li>

              <li>
                Gerardus Blokdyk,{' '}
                <span className="italic">
                  NoSQL Databases A Complete Guide
                </span>
                , 5STARCooks, 1st Edition, 2021.
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Additional Reference
            </h3>

            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                OpenAI, <span className="italic">ChatGPT</span>, used as an
                AI-assisted reference and development aid for explanations,
                implementation guidance and documentation.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
