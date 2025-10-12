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
});