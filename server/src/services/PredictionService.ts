import { activityRepository } from '../repositories/ActivityRepository';
import type { IPrediction, IAnalyticsTrend } from '../types';

export class PredictionService {
  /**
   * Predicts the user's carbon footprint for the upcoming month using a linear
   * regression model applied to the last six months of historical emission data.
   * Defaults to a simple average and a lower confidence value if data is insufficient.
   * 
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to the emission prediction details (predicted value, confidence, and direction).
   */
  async predictEmissions(userId: string): Promise<IPrediction> {
    // Get last 6 months of monthly data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const trends = await activityRepository.getEmissionsByPeriod(
      userId,
      'month',
      startDate,
      endDate,
    );

    if (trends.length < 2) {
      // Not enough data – use simple average
      const avg = trends.length > 0 ? trends[0].totalCarbonKg : 0;
      return {
        period: this.getNextMonthLabel(),
        predictedCarbonKg: parseFloat(avg.toFixed(2)),
        confidence: 0.3,
        trend: 'stable',
      };
    }

    const values = trends.map((t) => t.totalCarbonKg);
    const { slope, intercept } = this.linearRegression(values);
    const predicted = intercept + slope * values.length;
    const predictedClamped = Math.max(0, predicted);

    const ma = this.movingAverage(values, Math.min(3, values.length));
    const trendDirection = this.determineTrend(slope, ma);

    // Confidence based on data quality
    const confidence = Math.min(0.95, 0.4 + trends.length * 0.1);

    return {
      period: this.getNextMonthLabel(),
      predictedCarbonKg: parseFloat(predictedClamped.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      trend: trendDirection,
    };
  }

  /**
   * Calculates the linear regression parameters (slope and intercept) for a given series of data points.
   * Represents the formula: y = slope * x + intercept.
   * 
   * @param data - The array of numerical values to run regression on.
   * @returns An object containing the computed slope and intercept.
   */
  linearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length;
    if (n === 0) return { slope: 0, intercept: 0 };
    if (n === 1) return { slope: 0, intercept: data[0] };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return {
      slope: parseFloat(slope.toFixed(6)),
      intercept: parseFloat(intercept.toFixed(6)),
    };
  }

  /**
   * Computes a simple moving average (SMA) for an array of numbers with a specified window size.
   * 
   * @param data - The array of numbers to average.
   * @param window - The window size for the moving average calculation.
   * @returns An array of computed moving average points.
   */
  movingAverage(data: number[], window: number): number[] {
    if (data.length === 0 || window <= 0) return [];
    const result: number[] = [];
    const w = Math.min(window, data.length);

    for (let i = 0; i <= data.length - w; i++) {
      const slice = data.slice(i, i + w);
      const avg = slice.reduce((a, b) => a + b, 0) / w;
      result.push(parseFloat(avg.toFixed(4)));
    }
    return result;
  }

  /**
   * Identifies the current weekly emission trend direction ('increasing', 'decreasing', or 'stable')
   * based on the last 3 months of historical data.
   * 
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to the trend direction.
   */
  async getTrend(userId: string): Promise<'increasing' | 'decreasing' | 'stable'> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    const trends: IAnalyticsTrend[] = await activityRepository.getEmissionsByPeriod(
      userId,
      'week',
      startDate,
      endDate,
    );

    if (trends.length < 2) return 'stable';

    const values = trends.map((t) => t.totalCarbonKg);
    const { slope } = this.linearRegression(values);
    const ma = this.movingAverage(values, Math.min(3, values.length));
    return this.determineTrend(slope, ma);
  }

  // ─── Private helpers ──────────────────────────────────────────────

  /**
   * Internally determines the trend direction based on the slope magnitude
   * relative to a 5% threshold of the moving average.
   * 
   * @param slope - The calculated slope of the data regression.
   * @param movingAvg - The moving average array of values.
   * @returns The trend direction.
   */
  private determineTrend(
    slope: number,
    movingAvg: number[],
  ): 'increasing' | 'decreasing' | 'stable' {
    // Use slope threshold relative to the magnitude of the moving average
    const avgMagnitude =
      movingAvg.length > 0 ? movingAvg.reduce((a, b) => a + b, 0) / movingAvg.length : 1;
    const threshold = avgMagnitude * 0.05; // 5% of average magnitude

    if (slope > threshold) return 'increasing';
    if (slope < -threshold) return 'decreasing';
    return 'stable';
  }

  private getNextMonthLabel(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}

export const predictionService = new PredictionService();
