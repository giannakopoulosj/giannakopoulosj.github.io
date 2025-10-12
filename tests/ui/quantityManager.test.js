import { describe, it, expect, beforeEach } from 'vitest';
import { saveQuantities, loadQuantities } from '../../src/ui/quantityManager.js';
import { setupFullDOM } from '../helpers.js';

describe('Quantity Manager', () => {
  beforeEach(() => {
    setupFullDOM();
    document.getElementById('coin-list').innerHTML = `
      <div class="coin-item">
        <input class="coin-quantity" data-key="usa-dime" value="5" />
      </div>
    `;
    localStorage.clear();
  });

  it('saves quantities to localStorage', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    saveQuantities();
    
    const saved = JSON.parse(localStorage.getItem('coinQuantities'));
    expect(saved['usa-dime']).toBe('5');
  });

  it('loads quantities from localStorage', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    localStorage.setItem('coinQuantities', JSON.stringify({'usa-dime': '10'}));
    
    loadQuantities();
    
    const input = document.querySelector('.coin-quantity');
    expect(input.value).toBe('10');
  });
});