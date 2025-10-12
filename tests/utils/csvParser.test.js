import { describe, it, expect } from 'vitest';
import { parseCSV } from '../../src/utils/csvParser.js';

describe('CSV Parser', () => {
  it('parses valid CSV data', () => {
    const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,10,900,https://example.com`;
    
    const { data, errors } = parseCSV(csv);
    
    expect(errors).toHaveLength(0);
    expect(data).toHaveLength(1);
    expect(data[0].country).toBe('USA');
    expect(data[0].grossWeight).toBe(10);
    expect(data[0].purity).toBe(900);
  });

  it('handles quoted fields with commas', () => {
    const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,"Test, Comma",2000,10,900,https://example.com`;
    
    const { data } = parseCSV(csv);
    expect(data[0].name).toBe('Test, Comma');
  });

  it('validates grossWeight', () => {
    const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,-5,900,https://example.com`;
    
    const { data, errors } = parseCSV(csv);
    expect(data).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Invalid gross weight');
  });

  it('validates purity range', () => {
    const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,10,1500,https://example.com`;
    
    const { data, errors } = parseCSV(csv);
    expect(data).toHaveLength(0);
    expect(errors[0]).toContain('Invalid purity');
  });

  it('enforces max field length', () => {
    const longString = 'a'.repeat(3000);
    const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,${longString},2000,10,900,https://example.com`;
    
    const { errors } = parseCSV(csv);
    expect(errors.some(e => e.includes('exceeded max length'))).toBe(true);
  });

  it('stops parsing after max errors', () => {
    let csv = 'country,name,date,grossWeight,purity,numistaUrl\n';
    for (let i = 0; i < 150; i++) {
      csv += `USA,Coin${i},2000,-1,900,url\n`;
    }
    
    const { errors } = parseCSV(csv);
    expect(errors.length).toBeLessThanOrEqual(101);
    expect(errors[errors.length - 1]).toContain('Too many errors');
  });
});