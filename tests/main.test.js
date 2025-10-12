import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initApp } from '../src/main.js';
import { setupFullDOM } from './helpers.js';

describe('Main App Initialization', () => {
  beforeEach(() => {
    setupFullDOM();
    localStorage.clear();
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,10,900,https://example.com`)
      })
    );
  });

  it('initializes app successfully', async () => {
    await initApp();
    
    expect(document.getElementById('coin-list')).not.toBeNull();
    
    const coinItems = document.querySelectorAll('.coin-item');
    expect(coinItems.length).toBeGreaterThan(0);
  });

  it('handles CSV load errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );
    
    await initApp();
    
    const errorContainer = document.getElementById('error-container');
    expect(errorContainer.style.display).toBe('block');
    expect(errorContainer.innerHTML).toContain('Failed to load CSV');
  });

  // NEW TEST: Cover the catch block (lines 45-46)
  it('handles unexpected errors during initialization', async () => {
    // Mock initializeDOMElements to throw an error
    vi.doMock('../src/ui/domElements.js', () => ({
      initializeDOMElements: () => {
        throw new Error('DOM initialization failed');
      },
      errorContainer: document.getElementById('error-container'),
      coinListEl: document.getElementById('coin-list'),
      silverPriceTozEl: document.getElementById('silver-price-toz'),
      silverPriceGramEl: document.getElementById('silver-price-gram'),
      clearAllBtn: document.getElementById('clear-all-btn'),
      searchInput: document.getElementById('search-input'),
      clearSearchBtn: document.getElementById('clear-search-btn'),
      themeToggle: document.getElementById('theme-toggle'),
      totalsSection: document.getElementById('totals-section'),
      filteredIndicator: document.getElementById('filtered-indicator'),
      totalSilverWeightEl: document.querySelector('.total-silver-weight'),
      totalMeltValueEl: document.querySelector('.total-melt-value')
    }));

    // Need to re-import to get the mocked version
    vi.resetModules();
    const { initApp: initAppMocked } = await import('../src/main.js');
    
    await initAppMocked();
    
    // Verify error was displayed
    const errorContainer = document.getElementById('error-container');
    expect(errorContainer.innerHTML).toContain('Failed to initialize application');
    expect(errorContainer.innerHTML).toContain('DOM initialization failed');
  });
});