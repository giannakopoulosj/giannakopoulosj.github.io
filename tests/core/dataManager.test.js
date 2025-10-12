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
});