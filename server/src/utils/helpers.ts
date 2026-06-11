import type { PeriodType } from '../types';

/**
 * Return { start, end } Date objects for the given period relative to "now".
 */
export function getDateRange(period: PeriodType): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

/**
 * Format a raw kg CO₂ value to a human-friendly string.
 */
export function formatCarbonValue(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tonnes CO₂`;
  }
  return `${kg.toFixed(2)} kg CO₂`;
}

/**
 * Approximate number of mature trees required to absorb `kgCO2` in one year.
 * A mature tree absorbs roughly 22 kg CO₂ per year.
 */
export function treeEquivalent(kgCO2: number): number {
  return parseFloat((kgCO2 / 22).toFixed(1));
}

/**
 * Equivalent driving distance in km for an average car
 * that would produce the given CO₂.
 * Average car ≈ 0.21 kg CO₂ / km.
 */
export function kmEquivalent(kgCO2: number): number {
  return parseFloat((kgCO2 / 0.21).toFixed(1));
}

/**
 * Equivalent household electricity in kWh for the given CO₂.
 * Global average grid intensity ≈ 0.475 kg CO₂ / kWh.
 */
export function energyEquivalent(kgCO2: number): number {
  return parseFloat((kgCO2 / 0.475).toFixed(1));
}
