import { CATEGORY_DETAILS, CATEGORY_COLORS } from '../constants';
import type { ActivityCategory } from '../types';

// Local emission factors copy for client-side previews (kg CO2e per unit)
const CLIENT_EMISSION_FACTORS: Record<string, number> = {
  // Transportation (per km)
  car: 0.192,
  bus: 0.089,
  train: 0.041,
  airplane: 0.255,
  bicycle: 0,
  walking: 0,
  motorcycle: 0.113,
  // Electricity
  'grid electricity': 0.417,
  // Food (per kg)
  beef: 27.0,
  chicken: 6.9,
  fish: 6.1,
  vegetables: 2.0,
  dairy: 3.2,
  grains: 1.4,
  // Water (per liter)
  'shower/bath': 0.001,
  'tap water usage': 0.0003,
  'washing machine': 0.0005,
  // Shopping (per item)
  'clothing/apparel': 10.0,
  electronics: 50.0,
  'furniture/household': 100.0,
};

/**
 * Calculate the CO2 emission (in kg) for a given activity.
 */
export function calculateEmission(
  _category: ActivityCategory,
  subcategory: string,
  value: number,
): number {
  const normKey = subcategory.toLowerCase();
  const factor = CLIENT_EMISSION_FACTORS[normKey] ?? 0.2; // default fallback factor
  return Math.round(value * factor * 1000) / 1000;
}

/**
 * Get the display color for a category.
 */
export function getCategoryColor(category: ActivityCategory): string {
  return CATEGORY_COLORS[category] ?? '#64748b';
}

/**
 * Get the emoji icon for a category.
 */
export function getCategoryIcon(category: ActivityCategory): string {
  const cat = CATEGORY_DETAILS.find((c) => c.value === category);
  return cat?.icon ?? '📊';
}

/**
 * Get the display label for a category.
 */
export function getCategoryLabel(category: ActivityCategory): string {
  const cat = CATEGORY_DETAILS.find((c) => c.value === category);
  return cat?.label ?? category;
}

/**
 * Estimate the environmental impact equivalents.
 */
export function calculateEquivalents(totalKg: number) {
  return {
    treesNeeded: Math.round(totalKg * 0.0455),
    kmDriven: Math.round(totalKg * 4.6),
    energyKwh: Math.round(totalKg * 2.4),
    flightsEquivalent: Math.round((totalKg / 1000) * 1.54 * 10) / 10,
  };
}

/**
 * Get color for progress percentage (red → yellow → green gradient).
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#22c55e';
  if (percentage >= 75) return '#10b981';
  if (percentage >= 50) return '#f59e0b';
  if (percentage >= 25) return '#f97316';
  return '#ef4444';
}
