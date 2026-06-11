import {
  TRANSPORT_FACTORS,
  ELECTRICITY_FACTOR,
  FOOD_FACTORS,
  WATER_FACTOR,
  SHOPPING_FACTORS,
} from './emissionFactors';
import type { ITransportFactors, IFoodFactors, IShoppingFactors } from '../types';

/**
 * Calculate CO₂ emissions for a transportation activity.
 * @param mode – e.g. 'car', 'bus', 'airplane'
 * @param distanceKm – distance travelled in kilometres
 * @returns CO₂ in kg
 */
export function calculateTransportEmission(mode: string, distanceKm: number): number {
  const factor = TRANSPORT_FACTORS[mode as keyof ITransportFactors] ?? TRANSPORT_FACTORS.car;
  return parseFloat((factor * distanceKm).toFixed(4));
}

/**
 * Calculate CO₂ emissions for electricity consumption.
 * @param kWh – kilowatt-hours consumed
 * @returns CO₂ in kg
 */
export function calculateElectricityEmission(kWh: number): number {
  return parseFloat((ELECTRICITY_FACTOR * kWh).toFixed(4));
}

/**
 * Calculate CO₂ emissions for food consumption.
 * @param type – e.g. 'beef', 'chicken', 'vegetables'
 * @param weightKg – weight in kilograms
 * @returns CO₂ in kg
 */
export function calculateFoodEmission(type: string, weightKg: number): number {
  const factor = FOOD_FACTORS[type as keyof IFoodFactors] ?? FOOD_FACTORS.vegetables;
  return parseFloat((factor * weightKg).toFixed(4));
}

/**
 * Calculate CO₂ emissions for water usage.
 * @param liters – litres of water used
 * @returns CO₂ in kg
 */
export function calculateWaterEmission(liters: number): number {
  return parseFloat((WATER_FACTOR * liters).toFixed(4));
}

/**
 * Calculate CO₂ emissions for shopping purchases.
 * @param type – e.g. 'clothing', 'electronics', 'furniture'
 * @param quantity – number of items
 * @returns CO₂ in kg
 */
export function calculateShoppingEmission(type: string, quantity: number): number {
  const factor = SHOPPING_FACTORS[type as keyof IShoppingFactors] ?? SHOPPING_FACTORS.clothing;
  return parseFloat((factor * quantity).toFixed(4));
}

/**
 * Master calculation dispatcher.
 * Converts the raw (category, subcategory, value, unit) tuple into kg CO₂.
 */
export function calculateEmission(
  category: string,
  subcategory: string,
  value: number,
  unit: string,
): number {
  // Convert imperial to metric when needed
  let metricValue = value;
  if (unit === 'miles') metricValue = value * 1.60934;
  if (unit === 'lbs') metricValue = value * 0.453592;
  if (unit === 'gallons') metricValue = value * 3.78541;

  switch (category) {
    case 'transportation':
      return calculateTransportEmission(subcategory, metricValue);
    case 'electricity':
      return calculateElectricityEmission(metricValue);
    case 'food':
      return calculateFoodEmission(subcategory, metricValue);
    case 'water':
      return calculateWaterEmission(metricValue);
    case 'shopping':
      return calculateShoppingEmission(subcategory, metricValue);
    default:
      return 0;
  }
}
