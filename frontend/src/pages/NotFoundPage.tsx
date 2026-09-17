import { Link } from 'react-router-dom';

import { PageContainer } from '../components/layout/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer>
      <div className="py-16 text-center">
        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
          404
        </p>
        <h1 className="page-title mt-2">Page not found</h1>
        <p className="page-subtitle mx-auto">
          That route does not exist. It may have been renamed during
          integration.
        </p>
        <Link to="/" className="btn-primary mt-6">
          Back to home
        </Link>
      </div>
    </PageContainer>
  );
}
