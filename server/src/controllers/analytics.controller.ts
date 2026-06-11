import { Request, Response } from 'express';
import { analyticsService } from '../services/AnalyticsService';
import { predictionService } from '../services/PredictionService';
import { catchAsync } from '../middleware/errorHandler';
import type { PeriodType } from '../types';

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
