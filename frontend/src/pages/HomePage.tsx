import { Link } from 'react-router-dom';

import { PageContainer } from '../components/layout/PageContainer';
import { NAV_ITEMS } from '../components/layout/nav-items';
import { NORMAL_FORM_ORDER } from '../types/normalization';

export function HomePage() {
  return (
    <PageContainer>
      <section className="py-6 sm:py-12">
        <p className="mb-3 text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
          Database Systems Project
        </p>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          See exactly which normal form your schema is in — and why.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Enter a relation, its attributes and its functional dependencies. The
          analyser reports every normal form from 1NF to 5NF, names the
          dependency that breaks the weakest one, and shows the decomposition
          step by step.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/visualizer" className="btn-primary">
            Open the visualizer
          </Link>
          <Link to="/learn" className="btn-secondary">
            Learn the normal forms
          </Link>
        </div>
      </section>

      <section aria-labelledby="coverage-heading" className="mt-8">
        <h2 id="coverage-heading" className="section-title">
          Coverage
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {NORMAL_FORM_ORDER.map((normalForm) => (
            <li key={normalForm} className="chip-brand px-3 py-1.5 text-sm">
              {normalForm}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="explore-heading" className="mt-12">
        <h2 id="explore-heading" className="section-title">
          Explore
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="card-padded transition-colors hover:border-brand-400 dark:hover:border-brand-600"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {item.label}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
