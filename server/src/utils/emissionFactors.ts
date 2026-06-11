import type { IEmissionFactors, ITransportFactors, IFoodFactors, IShoppingFactors } from '../types';

/**
 * CO₂ emission factors sourced from EPA / DEFRA / IPCC averages.
 *
 * Transportation  – kg CO₂ per km
 * Electricity     – kg CO₂ per kWh  (global average grid intensity)
 * Food            – kg CO₂ per kg of food
 * Water           – kg CO₂ per litre (treatment + pumping)
 * Shopping        – kg CO₂ per item  (lifecycle average)
 */

export const TRANSPORT_FACTORS: Readonly<ITransportFactors> = {
  car: 0.21, // average passenger car
  bus: 0.089, // urban transit bus per passenger-km
  train: 0.041, // electric rail per passenger-km
  bicycle: 0.0, // zero direct emissions
  walking: 0.0, // zero direct emissions
  motorcycle: 0.113, // average motorcycle
  airplane: 0.255, // short-haul flight per passenger-km
} as const;

export const ELECTRICITY_FACTOR = 0.475; // kg CO₂ per kWh (global avg)

export const FOOD_FACTORS: Readonly<IFoodFactors> = {
  beef: 27.0, // kg CO₂ per kg
  chicken: 6.9, // kg CO₂ per kg
  fish: 6.1, // kg CO₂ per kg
  vegetables: 2.0, // kg CO₂ per kg (average)
  dairy: 3.2, // kg CO₂ per kg
  grains: 1.4, // kg CO₂ per kg
} as const;

export const WATER_FACTOR = 0.000298; // kg CO₂ per litre

export const SHOPPING_FACTORS: Readonly<IShoppingFactors> = {
  clothing: 10.0, // kg CO₂ per item (average garment)
  electronics: 50.0, // kg CO₂ per item (average device)
  furniture: 75.0, // kg CO₂ per item (average piece)
} as const;

export const EMISSION_FACTORS: Readonly<IEmissionFactors> = {
  transportation: TRANSPORT_FACTORS,
  electricity: ELECTRICITY_FACTOR,
  food: FOOD_FACTORS,
  water: WATER_FACTOR,
  shopping: SHOPPING_FACTORS,
} as const;
