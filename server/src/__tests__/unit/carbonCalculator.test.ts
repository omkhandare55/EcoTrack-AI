import { calculateEmission } from '../../utils/carbonCalculator';

describe('Carbon Calculator Unit Tests', () => {
  describe('calculateEmission', () => {
    it('should calculate transport emissions correctly for car', () => {
      const result = calculateEmission('transportation', 'car', 100, 'km');
      // Car emission factor = 0.21
      // 100 * 0.21 = 21
      expect(result).toBeCloseTo(21, 2);
    });

    it('should calculate transport emissions correctly for bicycle (zero)', () => {
      const result = calculateEmission('transportation', 'bicycle', 50, 'km');
      expect(result).toBe(0);
    });

    it('should calculate electricity emissions correctly', () => {
      const result = calculateEmission('electricity', 'Grid Electricity', 200, 'kWh');
      // Electricity factor = 0.475
      // 200 * 0.475 = 95
      expect(result).toBeCloseTo(95, 2);
    });

    it('should calculate food emissions correctly for beef', () => {
      const result = calculateEmission('food', 'beef', 2, 'kg');
      // Beef factor = 27
      // 2 * 27 = 54
      expect(result).toBe(54);
    });

    it('should calculate water emissions correctly', () => {
      const result = calculateEmission('water', 'Shower/Bath', 1000, 'liters');
      // Water factor = 0.000298
      // 1000 * 0.000298 = 0.298
      expect(result).toBeCloseTo(0.298, 4);
    });

    it('should calculate shopping emissions correctly for electronics', () => {
      const result = calculateEmission('shopping', 'electronics', 3, 'items');
      // Electronics factor = 50
      // 3 * 50 = 150
      expect(result).toBe(150);
    });

    it('should return 0 for unknown category', () => {
      const result = calculateEmission('unknown_cat', 'sub', 10, 'units');
      expect(result).toBe(0);
    });

    it('should convert imperial units correctly', () => {
      const result = calculateEmission('transportation', 'car', 62.1371, 'miles');
      // 62.1371 miles * 1.60934 = 100 km
      // 100 km * 0.21 = 21
      expect(result).toBeCloseTo(21, 1);
    });
  });
});
