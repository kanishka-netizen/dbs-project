import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { NAV_ITEMS } from './nav-items';
import { ThemeToggle } from './ThemeToggle';

/** Site navigation — owned by Team 2 (TripleX). */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    ].join(' ');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <nav
        className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3"
        aria-label="Main"
      >
        <NavLink
          to="/"
          className="mr-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white"
          onClick={() => setMenuOpen(false)}
        >
          <span className="grid size-8 place-items-center rounded-lg bg-brand-600 font-mono text-sm text-white">
            NF
          </span>
          <span className="hidden sm:inline">Normalization Visualizer</span>
        </NavLink>

        {/* Desktop navigation */}
        <div className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <ThemeToggle />

          <button
            type="button"
            className="btn-ghost px-2.5 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 px-4 py-2 md:hidden dark:border-slate-800"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${linkClass({ isActive })} block`
              }
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
