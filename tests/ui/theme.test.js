import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, saveTheme, loadTheme } from '../../src/ui/theme.js';
import { setupFullDOM } from '../helpers.js';

describe('Theme Manager', () => {
  beforeEach(() => {
    setupFullDOM();
    localStorage.clear();
    document.body.classList.remove('dark-mode');
  });

  it('applies dark theme', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    applyTheme('dark');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  it('applies light theme', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    applyTheme('light');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });

  it('saves theme to localStorage', () => {
    saveTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('loads saved theme', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    localStorage.setItem('theme', 'dark');
    loadTheme();
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });
});