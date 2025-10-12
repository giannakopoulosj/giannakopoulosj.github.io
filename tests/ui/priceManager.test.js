import { describe, it, expect, beforeEach } from 'vitest';
import { updateGramFromToz } from '../../src/ui/priceManager.js';
import { setupFullDOM } from '../helpers.js';

describe('Price Manager', () => {
  beforeEach(() => {
    setupFullDOM();
  });

  it('updates gram price from troy ounce', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    const tozInput = document.getElementById('silver-price-toz');
    tozInput.value = '31.1034768';
    
    updateGramFromToz();
    
    const gramInput = document.getElementById('silver-price-gram');
    expect(gramInput.value).toBe('1.0000');
  });

  it('handles negative prices', async () => {
    const { initializeDOMElements } = await import('../../src/ui/domElements.js');
    initializeDOMElements();
    
    const tozInput = document.getElementById('silver-price-toz');
    tozInput.value = '-10';
    
    updateGramFromToz();
    
    expect(tozInput.value).toBe('0');
  });
});