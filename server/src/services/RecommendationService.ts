import { activityRepository } from '../repositories/ActivityRepository';
import { getDateRange } from '../utils/helpers';
import type { IRecommendation, ICategoryBreakdown } from '../types';

// ─── Recommendation templates per category ─────────────────────────────────

interface RecommendationTemplate {
  title: string;
  description: string;
  estimatedSavingKg: number;
  category: string;
}

const TRANSPORT_TIPS: RecommendationTemplate[] = [
  {
    title: 'Switch to public transit',
    description:
      'Taking the bus or train instead of driving can reduce your transport emissions by up to 50%. Even 2–3 days a week makes a significant impact.',
    estimatedSavingKg: 4.5,
    category: 'transportation',
  },
  {
    title: 'Cycle for short trips',
    description:
      'For trips under 5 km, cycling produces zero emissions and improves health. Consider an e-bike for longer commutes.',
    estimatedSavingKg: 2.1,
    category: 'transportation',
  },
  {
    title: 'Carpool to work',
    description:
      'Sharing rides with colleagues can halve your per-person transport footprint and save on fuel costs.',
    estimatedSavingKg: 3.2,
    category: 'transportation',
  },
  {
    title: 'Work from home when possible',
    description: 'Remote work eliminates commute emissions entirely on those days.',
    estimatedSavingKg: 5.0,
    category: 'transportation',
  },
];

const ELECTRICITY_TIPS: RecommendationTemplate[] = [
  {
    title: 'Switch to LED lighting',
    description:
      'LED bulbs use up to 80% less energy than incandescent bulbs and last much longer.',
    estimatedSavingKg: 1.2,
    category: 'electricity',
  },
  {
    title: 'Use smart power strips',
    description:
      'Phantom loads from standby devices account for ~5–10% of household electricity. Smart strips cut power when devices are off.',
    estimatedSavingKg: 0.8,
    category: 'electricity',
  },
  {
    title: 'Adjust thermostat by 2°C',
    description:
      'Lowering heating by 2°C in winter (or raising cooling by 2°C in summer) can cut energy use by 5–10%.',
    estimatedSavingKg: 2.5,
    category: 'electricity',
  },
];

const FOOD_TIPS: RecommendationTemplate[] = [
  {
    title: 'Introduce meat-free days',
    description:
      'Having 2 meat-free days per week can significantly reduce your food-related carbon footprint, especially by avoiding beef.',
    estimatedSavingKg: 6.0,
    category: 'food',
  },
  {
    title: 'Buy seasonal & local produce',
    description:
      'Seasonal, local food requires less transportation and cold storage, reducing associated emissions.',
    estimatedSavingKg: 1.5,
    category: 'food',
  },
  {
    title: 'Reduce food waste',
    description:
      'Planning meals and storing food properly can cut waste by 30%, saving both money and emissions from landfill.',
    estimatedSavingKg: 2.0,
    category: 'food',
  },
];

const WATER_TIPS: RecommendationTemplate[] = [
  {
    title: 'Shorten showers by 2 minutes',
    description:
      'A shorter shower saves ~20 litres of water per shower and reduces energy used for heating.',
    estimatedSavingKg: 0.3,
    category: 'water',
  },
  {
    title: 'Fix leaking taps',
    description:
      'A dripping tap can waste over 5,000 litres per year. Fixing leaks is quick and cost-effective.',
    estimatedSavingKg: 0.15,
    category: 'water',
  },
];

const SHOPPING_TIPS: RecommendationTemplate[] = [
  {
    title: 'Buy second-hand clothing',
    description:
      'Thrift shopping extends garment life and avoids the ~10 kg CO₂ embodied in manufacturing new clothes.',
    estimatedSavingKg: 8.0,
    category: 'shopping',
  },
  {
    title: 'Repair instead of replacing electronics',
    description:
      "Extending a device's life by even one year avoids the ~50 kg CO₂ of manufacturing a replacement.",
    estimatedSavingKg: 25.0,
    category: 'shopping',
  },
];

const ALL_TIPS: Record<string, RecommendationTemplate[]> = {
  transportation: TRANSPORT_TIPS,
  electricity: ELECTRICITY_TIPS,
  food: FOOD_TIPS,
  water: WATER_TIPS,
  shopping: SHOPPING_TIPS,
};

export class RecommendationService {
  /**
   * Analyse a user's activity patterns and return personalised recommendations
   * sorted by estimated impact.
   */
  async getRecommendations(userId: string): Promise<IRecommendation[]> {
    const { start, end } = getDateRange('month');
    const breakdown = await activityRepository.getCategoryBreakdown(userId, start, end);

    const recommendations: IRecommendation[] = [];

    // Sort categories by emission (highest first) and assign priorities
    const sorted = [...breakdown].sort((a, b) => b.totalCarbonKg - a.totalCarbonKg);

    sorted.forEach((cat: ICategoryBreakdown, index: number) => {
      const priority = this.indexToPriority(index);
      const tips = ALL_TIPS[cat.category] ?? [];

      tips.forEach((tip) => {
        // Scale estimated saving by user's actual emission volume
        const scaledSaving = parseFloat(
          (tip.estimatedSavingKg * (cat.totalCarbonKg / 50 || 1)).toFixed(2),
        );
        recommendations.push({
          title: tip.title,
          description: tip.description,
          estimatedSavingKg: Math.max(scaledSaving, tip.estimatedSavingKg),
          category: tip.category,
          priority,
        });
      });
    });

    // If no activity data, give generic top tips from each category
    if (recommendations.length === 0) {
      Object.values(ALL_TIPS).forEach((tips) => {
        if (tips.length > 0) {
          recommendations.push({
            ...tips[0],
            priority: 'medium',
          });
        }
      });
    }

    // Sort by priority weight then by saving
    return recommendations.sort((a, b) => {
      const pw = { high: 3, medium: 2, low: 1 };
      const diff = pw[b.priority] - pw[a.priority];
      return diff !== 0 ? diff : b.estimatedSavingKg - a.estimatedSavingKg;
    });
  }

  private indexToPriority(index: number): 'high' | 'medium' | 'low' {
    if (index === 0) return 'high';
    if (index <= 2) return 'medium';
    return 'low';
  }
}

export const recommendationService = new RecommendationService();
