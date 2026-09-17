import type { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">{children}</div>
  );
}

export function PageHeader({
  title,
  subtitle,
  ownedBy,
}: {
  title: string;
  subtitle?: string;
  ownedBy?: string;
}) {
  return (
    <header className="mb-8">
      {ownedBy && (
        <p className="mb-2 text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
          {ownedBy}
        </p>
      )}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
}
