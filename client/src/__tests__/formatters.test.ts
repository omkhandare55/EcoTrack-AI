import {
  formatCarbonValue,
  formatDate,
  formatShortDate,
  formatRelativeDate,
  formatPercentage,
  formatNumber,
  formatDateRange,
  toInputDate,
  getTodayInput,
  capitalize,
  toTitleCase,
} from '../utils/formatters';

describe('Formatters Client Unit Tests', () => {
  describe('formatCarbonValue', () => {
    it('should format 0 correctly', () => {
      expect(formatCarbonValue(0)).toBe('0 kg');
    });

    it('should format mg correctly', () => {
      expect(formatCarbonValue(0.0005)).toBe('500.0 mg');
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

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      expect(formatDate('2026-06-11')).toBe('Jun 11, 2026');
    });
  });

  describe('formatShortDate', () => {
    it('should format short dates correctly', () => {
      expect(formatShortDate('2026-06-11')).toBe('Jun 11');
    });
  });

  describe('formatRelativeDate', () => {
    it('should format "Just now" correctly', () => {
      const now = new Date();
      expect(formatRelativeDate(now.toISOString())).toBe('Just now');
    });

    it('should format minutes ago', () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 5);
      expect(formatRelativeDate(date.toISOString())).toBe('5m ago');
    });

    it('should format hours ago', () => {
      const date = new Date();
      date.setHours(date.getHours() - 3);
      expect(formatRelativeDate(date.toISOString())).toBe('3h ago');
    });

    it('should format Yesterday', () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      expect(formatRelativeDate(date.toISOString())).toBe('Yesterday');
    });

    it('should format days ago', () => {
      const date = new Date();
      date.setDate(date.getDate() - 4);
      expect(formatRelativeDate(date.toISOString())).toBe('4d ago');
    });

    it('should format weeks ago', () => {
      const date = new Date();
      date.setDate(date.getDate() - 15);
      expect(formatRelativeDate(date.toISOString())).toBe('2w ago');
    });

    it('should format absolute dates if more than 30 days', () => {
      const date = new Date();
      date.setDate(date.getDate() - 45);
      expect(formatRelativeDate(date.toISOString())).toContain(String(date.getFullYear()));
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

  describe('formatDateRange', () => {
    it('should format date range within same month', () => {
      expect(formatDateRange('2026-06-10', '2026-06-15')).toBe('Jun 10–15, 2026');
    });

    it('should format date range across months in same year', () => {
      expect(formatDateRange('2026-06-10', '2026-07-05')).toBe('Jun 10 – Jul 5, 2026');
    });

    it('should format date range across years', () => {
      expect(formatDateRange('2025-12-25', '2026-01-05')).toBe('Dec 25, 2025 – Jan 5, 2026');
    });
  });

  describe('toInputDate & getTodayInput', () => {
    it('should format date for input value', () => {
      expect(toInputDate(new Date('2026-06-11'))).toBe('2026-06-11');
    });

    it('should get today formatted date for input', () => {
      expect(getTodayInput()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('capitalize & toTitleCase', () => {
    it('should capitalize single words', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should format underscore strings to title case', () => {
      expect(toTitleCase('grid_electricity')).toBe('Grid Electricity');
    });

    it('should handle simple words in title case', () => {
      expect(toTitleCase('transportation')).toBe('Transportation');
    });
  });
});
