import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderCoins, setupCoinQuantityListeners } from '../../src/ui/uiRenderer.js';
import { groupCoinsByCountry } from '../../src/core/dataManager.js';
import { setupFullDOM } from '../helpers.js';

describe('UI Renderer', () => {
  let initializeDOMElements;

  beforeEach(async () => {
    // Don't reset modules - we need the DOM element references to persist
    setupFullDOM();
    
    // Import fresh
    const domModule = await import('../../src/ui/domElements.js');
    initializeDOMElements = domModule.initializeDOMElements;
    initializeDOMElements();
  });

  it('renders coins with Numista URLs as links', () => {
    const coins = [
      { 
        country: 'USA', 
        name: 'Test Coin', 
        date: '2000',
        grossWeight: 10, 
        purity: 900,
        numistaUrl: 'https://numista.com/test'
      }
    ];
    
    groupCoinsByCountry(coins);
    renderCoins();
    
    const link = document.querySelector('.coin-name-link');
    expect(link).not.toBeNull();
    expect(link.href).toBe('https://numista.com/test');
    expect(link.target).toBe('_blank');
  });

  it('renders coins without Numista URL as plain text', () => {
    const coins = [
      { 
        country: 'USA', 
        name: 'No URL Coin', 
        date: '2000',
        grossWeight: 10, 
        purity: 900,
        numistaUrl: ''
      }
    ];
    
    groupCoinsByCountry(coins);
    renderCoins();
    
    const link = document.querySelector('.coin-name-link');
    expect(link).toBeNull();
    
    const span = document.querySelector('.coin-item span');
    expect(span).not.toBeNull();
    expect(span.textContent).toContain('No URL Coin');
  });

  it('handles coins with NaN values gracefully', () => {
    const coins = [
      { 
        country: 'USA', 
        name: 'Invalid Data', 
        date: '2000',
        silverWeight_grams: NaN, 
        silverWeight_tOz: NaN,
        purity: NaN,
        numistaUrl: ''
      }
    ];
    
    groupCoinsByCountry(coins);
    renderCoins();
    
    const coinItem = document.querySelector('.coin-item');
    expect(coinItem.textContent).toContain('N/A');
  });

  it('sets up quantity listeners successfully', () => {
    const coins = [
      { 
        country: 'USA', 
        name: 'Test', 
        date: '2000',
        grossWeight: 10, 
        purity: 900,
        numistaUrl: ''
      }
    ];
    
    groupCoinsByCountry(coins);
    renderCoins();
    
    const mockCallback = vi.fn();
    setupCoinQuantityListeners(mockCallback);
    
    const input = document.querySelector('.coin-quantity');
    input.value = '5';
    input.dispatchEvent(new Event('input'));
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('renders multiple countries sorted alphabetically', () => {
    const coins = [
      { country: 'UK', name: 'Pound', date: '2000', grossWeight: 10, purity: 900, numistaUrl: '' },
      { country: 'USA', name: 'Dollar', date: '2000', grossWeight: 10, purity: 900, numistaUrl: '' },
      { country: 'France', name: 'Franc', date: '2000', grossWeight: 10, purity: 900, numistaUrl: '' }
    ];
    
    groupCoinsByCountry(coins);
    renderCoins();
    
    const countryTitles = Array.from(document.querySelectorAll('.country-title'));
    const countryNames = countryTitles.map(el => el.textContent);
    
    expect(countryNames).toEqual(['France', 'UK', 'USA']);
  });

  it('generates correct data attributes for inputs', () => {
    const coins = [
      { 
        country: 'USA', 
        name: 'Test Coin', 
        date: '2000',
        grossWeight: 10, 
        purity: 900,
        numistaUrl: ''
      }
    ];
    
    groupCoinsByCountry(coins);
    renderCoins();
    
    const input = document.querySelector('.coin-quantity');
    expect(input.dataset.key).toBe('USA-Test_Coin-2000');
    expect(input.dataset.silverWeight).toBeTruthy();
  });
});