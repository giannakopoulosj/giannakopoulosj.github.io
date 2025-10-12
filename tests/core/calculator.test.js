import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setupFullDOM } from '../helpers.js';

// Import once at module level
let initializeDOMElements;
let calculateTotals;

describe('Calculator - Core Functionality', () => {
  beforeEach(async () => {
    // Reset modules to avoid state pollution
    vi.resetModules();
    
    setupFullDOM();
    document.getElementById('coin-list').innerHTML = `
      <details class="country-group">
        <summary class="country-title">USA</summary>
        <div class="coin-item">
          <span>Test Coin</span>
          <input class="coin-quantity" data-key="test-1" data-silver-weight="0.0723" value="10" />
          <span class="coin-subtotal">€0.00</span>
        </div>
      </details>
    `;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    
    // Import fresh modules for each test
    const domModule = await import('../../src/ui/domElements.js');
    const calcModule = await import('../../src/core/calculator.js');
    
    initializeDOMElements = domModule.initializeDOMElements;
    calculateTotals = calcModule.calculateTotals;
  });

  it('calculates totals correctly with positive values', () => {
    initializeDOMElements();
    
    document.getElementById('silver-price-toz').value = '30';
    document.querySelector('.coin-quantity').value = '10';
    
    calculateTotals();
    
    const totalWeight = document.querySelector('.total-silver-weight');
    const totalValue = document.querySelector('.total-melt-value');
    
    expect(totalWeight.textContent).toBe('0.723');
    expect(totalValue.textContent).toBe('21.69');
  });

  it('skips hidden coins in calculations', () => {
    initializeDOMElements();
    
    const coinItem = document.querySelector('.coin-item');
    coinItem.style.display = 'none';
    
    calculateTotals();
    
    const totalWeight = document.querySelector('.total-silver-weight');
    const totalValue = document.querySelector('.total-melt-value');
    
    expect(totalWeight.textContent).toBe('0.000');
    expect(totalValue.textContent).toBe('0.00');
  });
});

describe('Calculator - Edge Cases', () => {
  beforeEach(async () => {
    vi.resetModules();
    setupFullDOM();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    
    const domModule = await import('../../src/ui/domElements.js');
    const calcModule = await import('../../src/core/calculator.js');
    
    initializeDOMElements = domModule.initializeDOMElements;
    calculateTotals = calcModule.calculateTotals;
  });

  it('handles zero silver price', () => {
    document.getElementById('coin-list').innerHTML = `
      <div class="coin-item">
        <input class="coin-quantity" data-silver-weight="0.0723" value="10" />
        <span class="coin-subtotal">€0.00</span>
      </div>
    `;
    
    initializeDOMElements();
    
    document.getElementById('silver-price-toz').value = '0';
    
    calculateTotals();
    
    expect(document.querySelector('.total-melt-value').textContent).toBe('0.00');
  });

  it('handles negative silver price by converting to zero', () => {
    document.getElementById('coin-list').innerHTML = `
      <div class="coin-item">
        <input class="coin-quantity" data-silver-weight="0.0723" value="10" />
        <span class="coin-subtotal">€0.00</span>
      </div>
    `;
    
    initializeDOMElements();
    
    document.getElementById('silver-price-toz').value = '-50';
    
    calculateTotals();
    
    expect(document.querySelector('.total-melt-value').textContent).toBe('0.00');
  });

  it('handles zero quantity', () => {
    document.getElementById('coin-list').innerHTML = `
      <div class="coin-item">
        <input class="coin-quantity" data-silver-weight="0.0723" value="0" />
        <span class="coin-subtotal">€0.00</span>
      </div>
    `;
    
    initializeDOMElements();
    
    document.getElementById('silver-price-toz').value = '30';
    
    calculateTotals();
    
    expect(document.querySelector('.total-silver-weight').textContent).toBe('0.000');
    expect(document.querySelector('.coin-subtotal').textContent).toBe('€0.00');
  });

  it('handles negative quantity by converting to zero', () => {
    document.getElementById('coin-list').innerHTML = `
      <div class="coin-item">
        <input class="coin-quantity" data-silver-weight="0.0723" value="-5" />
        <span class="coin-subtotal">€0.00</span>
      </div>
    `;
    
    initializeDOMElements();
    
    calculateTotals();
    
    const input = document.querySelector('.coin-quantity');
    expect(input.value).toBe('0');
  });

  it('handles empty quantity input', () => {
    document.getElementById('coin-list').innerHTML = `
      <div class="coin-item">
        <input class="coin-quantity" data-silver-weight="0.0723" value="" />
        <span class="coin-subtotal">€0.00</span>
      </div>
    `;
    
    initializeDOMElements();
    
    calculateTotals();
    
    const input = document.querySelector('.coin-quantity');
    expect(input.value).toBe('0');
    expect(document.querySelector('.coin-subtotal').textContent).toBe('€0.00');
  });

  it('handles invalid (NaN) quantity', () => {
    document.getElementById('coin-list').innerHTML = `
      <div class="coin-item">
        <input class="coin-quantity" data-silver-weight="0.0723" value="abc" />
        <span class="coin-subtotal">€0.00</span>
      </div>
    `;
    
    initializeDOMElements();
    
    calculateTotals();
    
    const input = document.querySelector('.coin-quantity');
    expect(input.value).toBe('0');
  });

  it('handles decimal quantity by truncating in calculation but not display', () => {
    document.getElementById('coin-list').innerHTML = `
      <div class="coin-item">
        <input class="coin-quantity" data-silver-weight="0.0723" value="10.7" />
        <span class="coin-subtotal">€0.00</span>
      </div>
    `;
    
    initializeDOMElements();
    
    document.getElementById('silver-price-toz').value = '30';
    
    calculateTotals();
    
    const input = document.querySelector('.coin-quantity');
    expect(input.value).toBe('10.7');
    expect(document.querySelector('.total-silver-weight').textContent).toBe('0.723');
    expect(document.querySelector('.coin-subtotal').textContent).toBe('€21.69');
  });
});