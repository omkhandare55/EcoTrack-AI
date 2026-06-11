import {
  getDateRange,
  formatCarbonValue,
  treeEquivalent,
  kmEquivalent,
  energyEquivalent,
} from '../../utils/helpers';

describe('helpers', () => {
  // ───────────────────── getDateRange ─────────────────────

  describe('getDateRange', () => {
    let now: Date;

    beforeEach(() => {
      now = new Date();
    });

    it('should return start and end as Date objects', () => {
      const { start, end } = getDateRange('day');
      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
    });

    describe('period = "day"', () => {
      it('should set start to beginning of today', () => {
        const { start } = getDateRange('day');
        expect(start.getHours()).toBe(0);
        expect(start.getMinutes()).toBe(0);
        expect(start.getSeconds()).toBe(0);
        expect(start.getMilliseconds()).toBe(0);
        expect(start.getDate()).toBe(now.getDate());
      });

      it('should set end to end of today', () => {
        const { end } = getDateRange('day');
        expect(end.getHours()).toBe(23);
        expect(end.getMinutes()).toBe(59);
        expect(end.getSeconds()).toBe(59);
        expect(end.getMilliseconds()).toBe(999);
      });
    });

    describe('period = "week"', () => {
      it('should set start to beginning of the week (Sunday)', () => {
        const { start } = getDateRange('week');
        expect(start.getDay()).toBe(0); // Sunday
        expect(start.getHours()).toBe(0);
        expect(start.getMinutes()).toBe(0);
        expect(start.getSeconds()).toBe(0);
        expect(start.getMilliseconds()).toBe(0);
      });

      it('should set end to end of today', () => {
        const { end } = getDateRange('week');
        expect(end.getHours()).toBe(23);
        expect(end.getMinutes()).toBe(59);
        expect(end.getSeconds()).toBe(59);
        expect(end.getMilliseconds()).toBe(999);
      });

      it('start should be <= end', () => {
        const { start, end } = getDateRange('week');
        expect(start.getTime()).toBeLessThanOrEqual(end.getTime());
      });
    });

    describe('period = "month"', () => {
      it('should set start to the 1st of the current month', () => {
        const { start } = getDateRange('month');
        expect(start.getDate()).toBe(1);
        expect(start.getMonth()).toBe(now.getMonth());
        expect(start.getHours()).toBe(0);
        expect(start.getMinutes()).toBe(0);
        expect(start.getSeconds()).toBe(0);
        expect(start.getMilliseconds()).toBe(0);
      });

      it('should set end to end of today', () => {
        const { end } = getDateRange('month');
        expect(end.getHours()).toBe(23);
        expect(end.getMinutes()).toBe(59);
      });
    });

    describe('period = "year"', () => {
      it('should set start to Jan 1 of the current year', () => {
        const { start } = getDateRange('year');
        expect(start.getMonth()).toBe(0); // January
        expect(start.getDate()).toBe(1);
        expect(start.getFullYear()).toBe(now.getFullYear());
        expect(start.getHours()).toBe(0);
        expect(start.getMinutes()).toBe(0);
        expect(start.getSeconds()).toBe(0);
        expect(start.getMilliseconds()).toBe(0);
      });

      it('should set end to end of today', () => {
        const { end } = getDateRange('year');
        expect(end.getHours()).toBe(23);
        expect(end.getMinutes()).toBe(59);
        expect(end.getSeconds()).toBe(59);
        expect(end.getMilliseconds()).toBe(999);
      });

      it('start should be <= end', () => {
        const { start, end } = getDateRange('year');
        expect(start.getTime()).toBeLessThanOrEqual(end.getTime());
      });
    });
  });

  // ───────────────────── formatCarbonValue ─────────────────────

  describe('formatCarbonValue', () => {
    it('should format values below 1000 as kg CO₂', () => {
      expect(formatCarbonValue(1.5)).toBe('1.50 kg CO₂');
    });

    it('should format 0 as "0.00 kg CO₂"', () => {
      expect(formatCarbonValue(0)).toBe('0.00 kg CO₂');
    });

    it('should format 999.99 as kg CO₂', () => {
      expect(formatCarbonValue(999.99)).toBe('999.99 kg CO₂');
    });

    it('should format exactly 1000 as tonnes CO₂', () => {
      expect(formatCarbonValue(1000)).toBe('1.00 tonnes CO₂');
    });

    it('should format values above 1000 as tonnes CO₂', () => {
      expect(formatCarbonValue(2500)).toBe('2.50 tonnes CO₂');
    });

    it('should format very large values as tonnes CO₂', () => {
      expect(formatCarbonValue(12345.6)).toBe('12.35 tonnes CO₂');
    });

    it('should format decimal kg values with 2 decimal places', () => {
      expect(formatCarbonValue(42.789)).toBe('42.79 kg CO₂');
    });

    it('should format integer kg values with .00', () => {
      expect(formatCarbonValue(50)).toBe('50.00 kg CO₂');
    });
  });

  // ───────────────────── treeEquivalent ─────────────────────

  describe('treeEquivalent', () => {
    it('should divide by 22 and round to 1 decimal', () => {
      expect(treeEquivalent(22)).toBe(1.0);
    });

    it('should handle 0', () => {
      expect(treeEquivalent(0)).toBe(0);
    });

    it('should handle fractional results', () => {
      expect(treeEquivalent(100)).toBe(4.5);
    });

    it('should handle large values', () => {
      expect(treeEquivalent(1000)).toBe(45.5);
    });

    it('should handle small values', () => {
      expect(treeEquivalent(5)).toBe(0.2);
    });
  });

  // ───────────────────── kmEquivalent ─────────────────────

  describe('kmEquivalent', () => {
    it('should divide by 0.21 and round to 1 decimal', () => {
      expect(kmEquivalent(0.21)).toBe(1.0);
    });

    it('should handle 0', () => {
      expect(kmEquivalent(0)).toBe(0);
    });

    it('should handle typical values', () => {
      // 10 / 0.21 = 47.619... → 47.6
      expect(kmEquivalent(10)).toBe(47.6);
    });

    it('should handle large values', () => {
      // 100 / 0.21 = 476.190... → 476.2
      expect(kmEquivalent(100)).toBe(476.2);
    });

    it('should handle small values', () => {
      // 1 / 0.21 = 4.761... → 4.8
      expect(kmEquivalent(1)).toBe(4.8);
    });
  });

  // ───────────────────── energyEquivalent ─────────────────────

  describe('energyEquivalent', () => {
    it('should divide by 0.475 and round to 1 decimal', () => {
      expect(energyEquivalent(0.475)).toBe(1.0);
    });

    it('should handle 0', () => {
      expect(energyEquivalent(0)).toBe(0);
    });

    it('should handle typical values', () => {
      // 10 / 0.475 = 21.052... → 21.1
      expect(energyEquivalent(10)).toBe(21.1);
    });

    it('should handle large values', () => {
      // 100 / 0.475 = 210.526... → 210.5
      expect(energyEquivalent(100)).toBe(210.5);
    });

    it('should handle small values', () => {
      // 1 / 0.475 = 2.105... → 2.1
      expect(energyEquivalent(1)).toBe(2.1);
    });
  });
});
