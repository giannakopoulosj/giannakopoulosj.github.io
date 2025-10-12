import { describe, it, expect } from 'vitest';
import { validatePositiveNumber, validatePositiveInteger } from '../../src/utils/validation.js';

describe('validation utilities', () => {
  describe('validatePositiveNumber', () => {
    it('returns valid positive numbers', () => {
      expect(validatePositiveNumber('42.5')).toBe(42.5);
      expect(validatePositiveNumber(100)).toBe(100);
    });

    it('returns default for negative numbers', () => {
      expect(validatePositiveNumber('-5')).toBe(0);
      expect(validatePositiveNumber(-10, 5)).toBe(5);
    });

    it('returns default for NaN', () => {
      expect(validatePositiveNumber('invalid')).toBe(0);
      expect(validatePositiveNumber('')).toBe(0);
    });
  });

  describe('validatePositiveInteger', () => {
    it('returns valid integers', () => {
      expect(validatePositiveInteger('42')).toBe(42);
      expect(validatePositiveInteger('42.9')).toBe(42);
    });

    it('returns default for invalid values', () => {
      expect(validatePositiveInteger('-5')).toBe(0);
      expect(validatePositiveInteger('abc')).toBe(0);
    });
  });
});