import React, { useState } from 'react';
import {
  useAnalyticsSummary,
  useAnalyticsTrends,
  useComparison,
  usePredictions,
} from '../hooks/useAnalytics';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { Alert } from '../components/common/Alert';
import { EmissionTrendChart } from '../components/charts/EmissionTrendChart';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import { ComparisonChart } from '../components/charts/ComparisonChart';
import { formatCarbonValue, formatPercentage } from '../utils/formatters';

export const AnalyticsPage: React.FC = () => {
  const [trendPeriod, setTrendPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useAnalyticsSummary();
  const { data: trends, isLoading: isTrendsLoading } = useAnalyticsTrends(trendPeriod);
  const { data: comparison, isLoading: isComparisonLoading } = useComparison();
  const { data: prediction, isLoading: isPredictionLoading } = usePredictions();

  const isLoading =
    isSummaryLoading || isTrendsLoading || isComparisonLoading || isPredictionLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spinner size="lg" label="Computing carbon analytics..." />
      </div>
    );
  }

  if (isSummaryError || !summary || !trends || !comparison || !prediction) {
    return (
      <Alert
        type="error"
        message="Failed to compute analytics charts. Please refresh or try again later."
      />
    );
  }

  return (
    <div className="analytics-page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
          Carbon Footprint Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Deep dive insights into your consumption habits and future trend predictions.
        </p>
      </div>

      {/* AI Prediction Notice */}
      <Card
        tagName="section"
        className="prediction-notice-card"
        style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '2rem' }} aria-hidden="true">
            🔮
          </span>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              EcoTrack AI Footprint Forecast
            </h2>
            <p style={{ margin: '0.25rem 0 0.75rem 0', color: 'var(--text-secondary)' }}>
              Using linear regression models over your historical logging patterns, the AI forecasts
              the following:
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  PREDICTED NEXT MONTH EMISSIONS
                </span>
                <p
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {formatCarbonValue(prediction.predictedCarbonKg)}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  FORECAST TREND DIRECTION
                </span>
                <p
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color:
                      prediction.trend === 'decreasing'
                        ? 'var(--success)'
                        : prediction.trend === 'increasing'
                          ? 'var(--danger)'
                          : 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {prediction.trend.toUpperCase()}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  AI MODEL CONFIDENCE
                </span>
                <p
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {formatPercentage(prediction.confidence * 100)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Trend Period Switcher and Line Chart */}
      <Card tagName="section" title="Emissions Over Time" style={{ marginBottom: '2rem' }}>
        <div
          className="tab-switcher"
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}
        >
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={`btn ${trendPeriod === p ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTrendPeriod(p)}
              aria-label={`Show trends by ${p}`}
            >
              By {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <EmissionTrendChart data={trends} period={trendPeriod} />
      </Card>

      {/* Split Charts: Category Breakdown & Comparison */}
      <div
        className="charts-split-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <Card title="Category Split (Cumulative)" tagName="section">
          {summary.categoryBreakdown.length > 0 ? (
            <CategoryBreakdownChart data={summary.categoryBreakdown} />
          ) : (
            <p style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              No categories mapped. Log an activity to check breakdown.
            </p>
          )}
        </Card>

        <Card title="Period-over-Period Performance" tagName="section">
          <ComparisonChart
            currentWeek={comparison.currentWeek}
            previousWeek={comparison.previousWeek}
            weekChange={comparison.weekChange}
            currentMonth={comparison.currentMonth}
            previousMonth={comparison.previousMonth}
            monthChange={comparison.monthChange}
          />
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
