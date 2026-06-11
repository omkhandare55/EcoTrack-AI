import {
  formatCarbonValue,
  formatPercentage,
  toTitleCase,
  formatNumber,
} from '../utils/formatters';

describe('Formatters Client Unit Tests', () => {
  describe('formatCarbonValue', () => {
    it('should format 0 correctly', () => {
      expect(formatCarbonValue(0)).toBe('0 kg');
    });

    it('should format grams correctly', () => {
      expect(formatCarbonValue(0.55)).toBe('550 g');
    });

    it('should format kilograms correctly', () => {
      expect(formatCarbonValue(12.34)).toBe('12.3 kg');
    });

    it('should format tons correctly', () => {
      expect(formatCarbonValue(1234.56)).toBe('1.23 t');
    });

    it('should handle negative values correctly', () => {
      expect(formatCarbonValue(-5)).toBe('-5.0 kg');
    });
  });

  describe('formatPercentage', () => {
    it('should format positive percentage with plus sign', () => {
      expect(formatPercentage(15)).toBe('+15.0%');
    });

    it('should format negative percentage', () => {
      expect(formatPercentage(-5.5)).toBe('-5.5%');
    });
  });

  describe('toTitleCase', () => {
    it('should format underscore strings correctly', () => {
      expect(toTitleCase('grid_electricity')).toBe('Grid Electricity');
    });

    it('should handle simple words', () => {
      expect(toTitleCase('transportation')).toBe('Transportation');
    });
  });

  describe('formatNumber', () => {
    it('should format thousands as K', () => {
      expect(formatNumber(1500)).toBe('1.5K');
    });

    it('should format millions as M', () => {
      expect(formatNumber(2300000)).toBe('2.3M');
    });

    it('should show localized number under 1000', () => {
      expect(formatNumber(456)).toBe('456');
    });
  });
});
