import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('offers day, night and auto', () => {
    renderToggle();

    expect(
      screen.getByRole('button', { name: /always use day mode/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /always use night mode/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /follow the operating system/i }),
    ).toBeInTheDocument();
  });

  it('defaults to following the system', () => {
    renderToggle();

    expect(
      screen.getByRole('button', { name: /follow the operating system/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to night mode and applies the dark class', () => {
    renderToggle();

    fireEvent.click(
      screen.getByRole('button', { name: /always use night mode/i }),
    );

    expect(
      screen.getByRole('button', { name: /always use night mode/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('switches back to day mode', () => {
    renderToggle();

    fireEvent.click(
      screen.getByRole('button', { name: /always use night mode/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /always use day mode/i }),
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('remembers the choice', () => {
    renderToggle();

    fireEvent.click(
      screen.getByRole('button', { name: /always use night mode/i }),
    );

    expect(localStorage.getItem('dbs-theme')).toBe('dark');
  });

  it('exposes the group to assistive technology', () => {
    renderToggle();

    expect(
      screen.getByRole('group', { name: /colour theme/i }),
    ).toBeInTheDocument();
  });
});
