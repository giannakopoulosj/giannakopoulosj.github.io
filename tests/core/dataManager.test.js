import { describe, it, expect } from 'vitest';
import { groupCoinsByCountry } from '../../src/core/dataManager.js';

describe('Data Manager', () => {
  it('groups coins by country', () => {
    const coins = [
      { country: 'USA', name: 'Dime', grossWeight: 2.5, purity: 900 },
      { country: 'USA', name: 'Quarter', grossWeight: 6.25, purity: 900 },
      { country: 'UK', name: 'Shilling', grossWeight: 5.66, purity: 925 }
    ];
    
    const grouped = groupCoinsByCountry(coins);
    
    expect(Object.keys(grouped)).toEqual(['USA', 'UK']);
    expect(grouped.USA).toHaveLength(2);
    expect(grouped.UK).toHaveLength(1);
  });

  it('calculates silver weight correctly', () => {
    const coins = [
      { country: 'USA', name: 'Test', grossWeight: 10, purity: 900 }
    ];
    
    const grouped = groupCoinsByCountry(coins);
    const coin = grouped.USA[0];
    
    expect(coin.silverWeight_grams).toBe(9);
    expect(coin.silverWeight_tOz).toBe(9 / 31.1034768);
  });

  it('handles purity as per mille', () => {
    const coins = [
      { country: 'Test', name: 'Coin', grossWeight: 10, purity: 835 }
    ];
    
    const grouped = groupCoinsByCountry(coins);
    expect(grouped.Test[0].silverWeight_grams).toBe(8.35);
  });

  // NEW TEST: Cover lines 17-22 (decimal purity)
  it('handles purity as decimal (0-1)', () => {
    const coins = [
      { country: 'Test', name: 'Coin', grossWeight: 10, purity: 0.9 }
    ];
    
    const grouped = groupCoinsByCountry(coins);
    expect(grouped.Test[0].silverWeight_grams).toBe(9); // 10 * 0.9
  });

  // NEW TEST: Cover lines 17-22 (invalid purity fallback)
  it('handles invalid purity by setting to zero', () => {
    const coins = [
      { country: 'Test', name: 'Invalid', grossWeight: 10, purity: -5 }
    ];
    
    const grouped = groupCoinsByCountry(coins);
    expect(grouped.Test[0].silverWeight_grams).toBe(0); // 10 * 0 (fallback)
    expect(grouped.Test[0].silverWeight_tOz).toBe(0);
  });

  // NEW TEST: Cover the missing country check
  it('skips coins without country', () => {
    const coins = [
      { country: '', name: 'No Country', grossWeight: 10, purity: 900 },
      { country: null, name: 'Null Country', grossWeight: 10, purity: 900 },
      { country: 'USA', name: 'Valid', grossWeight: 10, purity: 900 }
    ];
    
    const grouped = groupCoinsByCountry(coins);
    
    // Only USA should be in the result
    expect(Object.keys(grouped)).toEqual(['USA']);
    expect(grouped.USA).toHaveLength(1);
  });

  // NEW TEST: Cover edge case with purity = 1000 (boundary)
  it('handles purity at boundary value 1000', () => {
    const coins = [
      { country: 'Test', name: 'Pure', grossWeight: 10, purity: 1000 }
    ];
    
    const grouped = groupCoinsByCountry(coins);
    expect(grouped.Test[0].silverWeight_grams).toBe(10); // 10 * 1.0
  });

  // NEW TEST: Cover edge case with purity = 1 (boundary)
  it('handles purity at boundary value 1', () => {
    const coins = [
      { country: 'Test', name: 'Min', grossWeight: 10, purity: 1 }
    ];
    
    const grouped = groupCoinsByCountry(coins);
    expect(grouped.Test[0].silverWeight_grams).toBe(0.01); // 10 * 0.001
  });
});