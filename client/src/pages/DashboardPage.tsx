import React, { useState } from 'react';
import { useAnalyticsSummary, useAnalyticsTrends } from '../hooks/useAnalytics';
import { useGoals } from '../hooks/useGoals';
import { useActivities } from '../hooks/useActivities';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import { Alert } from '../components/common/Alert';
import { ActivityForm } from '../components/forms/ActivityForm';
import { EmissionTrendChart } from '../components/charts/EmissionTrendChart';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import { GoalProgressChart } from '../components/charts/GoalProgressChart';
import { formatCarbonValue, formatPercentage, formatDate } from '../utils/formatters';

const CATEGORY_ICONS: Record<string, string> = {
  transportation: '🚗',
  electricity: '⚡',
  food: '🍽️',
  water: '💧',
  shopping: '🛍️',
};

export const DashboardPage: React.FC = () => {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useAnalyticsSummary();
  const { data: goalsData, isLoading: isGoalsLoading } = useGoals();
  const { data: activitiesData, isLoading: isActivitiesLoading } = useActivities({ limit: 5 });
  const { data: trendsData } = useAnalyticsTrends('day', 30);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  if (isSummaryLoading || isGoalsLoading || isActivitiesLoading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="lg" label="Loading dashboard data..." />
      </div>
    );
  }

  if (isSummaryError || !summary) {
    return (
      <Alert
        type="error"
        message="Failed to load dashboard statistics. Please refresh or try again later."
      />
    );
  }

  const { totalEmissions, categoryBreakdown, dailyAverage, comparison } = summary;

  // Calculable environmental equivalences based on monthly total
  const monthlyCarbon = totalEmissions.thisMonth;
  const treesEquivalent = Math.round(monthlyCarbon / 1.83);
  const carKmEquivalent = Math.round(monthlyCarbon / 0.2);
  const electricityKwhEquivalent = Math.round(monthlyCarbon / 0.4);

  const activeGoals = (goalsData || []).filter((g) => g.status === 'active').slice(0, 3);
  const recentActivities = activitiesData?.data || [];

  return (
    <div className="dashboard-page animate-fade-in-up">
      {/* Header Section */}
      <div className="dashboard-header-bar">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome to EcoTrack AI. Here is your environmental footprint summary.
          </p>
        </div>
        <Button onClick={() => setIsLogModalOpen(true)}>
          <span aria-hidden="true" className="btn-icon-prefix">
            +
          </span>
          Log Activity
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="dashboard-grid">
        <Card title="Today's Carbon" tagName="section" className="stat-card">
          <p className="stat-number stat-number--accent">
            {formatCarbonValue(totalEmissions.today)}
          </p>
          <span className="stat-label">Logged today</span>
        </Card>

        <Card title="This Week" tagName="section" className="stat-card">
          <p className="stat-number">{formatCarbonValue(totalEmissions.thisWeek)}</p>
          <span
            className={`stat-change ${comparison.weekOverWeek > 0 ? 'stat-change--negative' : 'stat-change--positive'}`}
          >
            {comparison.weekOverWeek > 0 ? '▲' : '▼'}{' '}
            {formatPercentage(Math.abs(comparison.weekOverWeek))} vs last week
          </span>
        </Card>

        <Card title="This Month" tagName="section" className="stat-card">
          <p className="stat-number">{formatCarbonValue(totalEmissions.thisMonth)}</p>
          <span
            className={`stat-change ${comparison.monthOverMonth > 0 ? 'stat-change--negative' : 'stat-change--positive'}`}
          >
            {comparison.monthOverMonth > 0 ? '▲' : '▼'}{' '}
            {formatPercentage(Math.abs(comparison.monthOverMonth))} vs last month
          </span>
        </Card>

        <Card title="Daily Average" tagName="section" className="stat-card">
          <p className="stat-number">{formatCarbonValue(dailyAverage)}</p>
          <span className="stat-label">30-day average</span>
        </Card>
      </div>

      {/* Main Charts Layout */}
      <div className="dashboard-charts">
        <Card title="Monthly Trend (Past 30 Days)" tagName="section">
          <EmissionTrendChart data={trendsData || []} period="day" />
        </Card>

        <Card title="Category Breakdown (This Month)" tagName="section">
          {categoryBreakdown.length > 0 ? (
            <CategoryBreakdownChart data={categoryBreakdown} />
          ) : (
            <p className="empty-state-text">No data logged this month.</p>
          )}
        </Card>
      </div>

      {/* Goals & Activities Split */}
      <div className="dashboard-bottom">
        <Card title="Active Goals" tagName="section">
          {activeGoals.length > 0 ? (
            <div className="goals-list-compact">
              {activeGoals.map((goal) => (
                <GoalProgressChart
                  key={goal._id}
                  label={goal.title}
                  current={goal.currentValue}
                  target={goal.targetReduction}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state-text">
              You have no active goals set. Set one to start tracking carbon reduction progress!
            </p>
          )}
        </Card>

        <Card title="Recent Activity Log" tagName="section">
          {recentActivities.length > 0 ? (
            <ul className="activity-feed">
              {recentActivities.map((act) => (
                <li key={act._id} className="activity-feed-item">
                  <span
                    className="activity-feed-icon"
                    style={{
                      background: `var(--accent-primary-light)`,
                    }}
                  >
                    {CATEGORY_ICONS[act.category] || '📋'}
                  </span>
                  <div className="activity-feed-details">
                    <p className="activity-feed-title">{act.subcategory}</p>
                    <span className="activity-feed-meta">
                      {act.category.toUpperCase()} &bull; {formatDate(act.date)}
                    </span>
                  </div>
                  <span className="activity-feed-value" style={{ color: 'var(--danger)' }}>
                    +{formatCarbonValue(act.carbonKg)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state-text">No activities logged yet.</p>
          )}
        </Card>
      </div>

      {/* Environmental Equivalencies Card */}
      <Card
        title="Your Carbon Equivalencies (Monthly Footprint)"
        tagName="section"
        className="equivalences-card"
      >
        <div className="equivalents-grid">
          <div className="equivalent-card">
            <span className="equivalent-icon" aria-hidden="true">
              🌳
            </span>
            <p className="equivalent-value">{treesEquivalent}</p>
            <span className="equivalent-label">Trees required to offset this footprint</span>
          </div>
          <div className="equivalent-card">
            <span className="equivalent-icon" aria-hidden="true">
              🚗
            </span>
            <p className="equivalent-value">{carKmEquivalent} km</p>
            <span className="equivalent-label">Passenger car driving distance equivalent</span>
          </div>
          <div className="equivalent-card">
            <span className="equivalent-icon" aria-hidden="true">
              💡
            </span>
            <p className="equivalent-value">{electricityKwhEquivalent} kWh</p>
            <span className="equivalent-label">Electricity usage carbon equivalent</span>
          </div>
        </div>
      </Card>

      {/* Log Activity Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log New Carbon Footprint Activity"
      >
        <ActivityForm onSuccess={() => setIsLogModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default DashboardPage;
