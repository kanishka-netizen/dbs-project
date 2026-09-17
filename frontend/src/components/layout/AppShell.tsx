import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';

/** Page frame — owned by Team 2 (TripleX). */
export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-6 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 text-sm text-slate-500 dark:text-slate-500">
          Database Normalization Visualizer — a three-team course project.
        </div>
      </footer>
    </div>
  );
}
