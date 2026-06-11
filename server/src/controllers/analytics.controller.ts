import { Request, Response } from 'express';
import { analyticsService } from '../services/AnalyticsService';
import { predictionService } from '../services/PredictionService';
import { catchAsync } from '../middleware/errorHandler';
import type { PeriodType } from '../types';

/**
 * Controller endpoint to retrieve a high-level dashboard analytics summary for the user.
 *
 * @route GET /api/v1/analytics/summary
 * @access Private
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A promise resolving to the user's dashboard analytics summary.
 */
export const getSummary = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const summary = await analyticsService.getSummary(userId);

  res.status(200).json({
    status: 'success',
    data: {
      summary,
    },
  });
});

/**
 * Controller endpoint to retrieve time-series carbon emission trends for charts.
 *
 * @route GET /api/v1/analytics/trends
 * @access Private
 * @param req - Express request object with query parameters.
 * @param res - Express response object.
 * @returns A promise resolving to the user's emission trends.
 */
export const getTrends = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { period, rangeDays } = req.query;

  const trends = await analyticsService.getTrends(
    userId,
    period as PeriodType,
    rangeDays ? parseInt(rangeDays as string, 10) : undefined,
  );

  res.status(200).json({
    status: 'success',
    data: {
      trends,
    },
  });
});

/**
 * Controller endpoint to retrieve detailed category-wise carbon breakdown for a date range.
 *
 * @route GET /api/v1/analytics/breakdown
 * @access Private
 * @param req - Express request object with optional date filters in query.
 * @param res - Express response object.
 * @returns A promise resolving to the category breakdown records.
 */
export const getBreakdown = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { startDate, endDate } = req.query;

  const breakdown = await analyticsService.getBreakdown(
    userId,
    startDate as string,
    endDate as string,
  );

  res.status(200).json({
    status: 'success',
    data: {
      breakdown,
    },
  });
});

/**
 * Controller endpoint to retrieve a comparison of carbon footprint metrics for the current vs previous periods.
 *
 * @route GET /api/v1/analytics/comparison
 * @access Private
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A promise resolving to the comparison statistics.
 */
export const getComparison = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const comparison = await analyticsService.getComparison(userId);

  res.status(200).json({
    status: 'success',
    data: {
      comparison,
    },
  });
});

/**
 * Controller endpoint to retrieve future monthly carbon emission predictions.
 *
 * @route GET /api/v1/analytics/predictions
 * @access Private
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A promise resolving to future emission predictions.
 */
export const getPredictions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const prediction = await predictionService.predictEmissions(userId);

  res.status(200).json({
    status: 'success',
    data: {
      prediction,
    },
  });
});
