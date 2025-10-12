import { describe, it, expect, beforeEach } from 'vitest';
import { filterCoins } from '../../src/ui/searchFilter.js';
import { setupFullDOM } from '../helpers.js';

describe('Search Filter', () => {
  beforeEach(() => {
    setupFullDOM();
    document.getElementById('coin-list').innerHTML = `
      <details class="country-group" open>
        <summary class="country-title">USA</summary>
        <div class="coin-item" style="display: flex;">
          <span>Mercury Dime 1916-1945</span>
          <input class="coin-quantity" value="0" />
        </div>
        <div class="coin-item" style="display: flex;">
          <span>Roosevelt Dime 1946-1964</span>
          <input class="coin-quantity" value="0" />
        </div>
      </details>
      <details class="country-group" open>
        <summary class="country-title">UK</summary>
        <div class="coin-item" style="display: flex;">
          <span>Shilling 1902-1919</span>
          <input class="coin-quantity" value="0" />
        </div>
      </details>
    `;
  });

  it('filters coins by single keyword', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    const searchInput = document.getElementById('search-input');
    searchInput.value = 'mercury';
    
    filterCoins();
    
    const items = document.querySelectorAll('.coin-item');
    expect(items[0].style.display).toBe('flex');
    expect(items[1].style.display).toBe('none');
    expect(items[2].style.display).toBe('none');
  });

  it('filters coins by country', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    const searchInput = document.getElementById('search-input');
    searchInput.value = 'UK';
    
    filterCoins();
    
    const groups = document.querySelectorAll('.country-group');
    expect(groups[0].style.display).toBe('none');
    expect(groups[1].style.display).toBe('block');
  });

  it('shows all coins when search is cleared', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    
    filterCoins();
    
    const groups = document.querySelectorAll('.country-group');
    groups.forEach(group => {
      expect(group.style.display).toBe('block');
    });
  });
});