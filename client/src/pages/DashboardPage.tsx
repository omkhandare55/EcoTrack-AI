import React, { useState } from 'react';
import { useAnalyticsSummary } from '../hooks/useAnalytics';
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

export const DashboardPage: React.FC = () => {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useAnalyticsSummary();
  const { data: goalsData, isLoading: isGoalsLoading } = useGoals();
  const { data: activitiesData, isLoading: isActivitiesLoading } = useActivities({ limit: 5 });

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  if (isSummaryLoading || isGoalsLoading || isActivitiesLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
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
  // Assumes average carbon offset of an adult tree is 22kg/year, roughly 1.83kg/month
  const treesEquivalent = Math.round(monthlyCarbon / 1.83);
  // Assumes average passenger vehicle emissions of 0.2kg/km
  const carKmEquivalent = Math.round(monthlyCarbon / 0.2);
  // Assumes average household electricity emission factor of 0.4kg/kWh
  const electricityKwhEquivalent = Math.round(monthlyCarbon / 0.4);

  const activeGoals = (goalsData || []).filter((g) => g.status === 'active').slice(0, 3);
  const recentActivities = activitiesData?.data || [];

  return (
    <div className="dashboard-grid-container">
      <div
        className="dashboard-header-row"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome to EcoTrack AI. Here is your environmental footprint summary.
          </p>
        </div>
        <Button onClick={() => setIsLogModalOpen(true)}>
          <span aria-hidden="true" style={{ marginRight: '8px' }}>
            +
          </span>{' '}
          Log Activity
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div
        className="stats-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Card title="Today's Carbon" tagName="section">
          <p
            className="stat-number"
            style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}
          >
            {formatCarbonValue(totalEmissions.today)}
          </p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logged today</span>
        </Card>

        <Card title="This Week" tagName="section">
          <p className="stat-number" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {formatCarbonValue(totalEmissions.thisWeek)}
          </p>
          <span
            style={{
              fontSize: '0.85rem',
              color: comparison.weekOverWeek > 0 ? 'var(--danger)' : 'var(--success)',
            }}
          >
            {comparison.weekOverWeek > 0 ? '▲' : '▼'}{' '}
            {formatPercentage(Math.abs(comparison.weekOverWeek))} vs last week
          </span>
        </Card>

        <Card title="This Month" tagName="section">
          <p className="stat-number" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {formatCarbonValue(totalEmissions.thisMonth)}
          </p>
          <span
            style={{
              fontSize: '0.85rem',
              color: comparison.monthOverMonth > 0 ? 'var(--danger)' : 'var(--success)',
            }}
          >
            {comparison.monthOverMonth > 0 ? '▲' : '▼'}{' '}
            {formatPercentage(Math.abs(comparison.monthOverMonth))} vs last month
          </span>
        </Card>

        <Card title="Daily Average" tagName="section">
          <p className="stat-number" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {formatCarbonValue(dailyAverage)}
          </p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>30-day average</span>
        </Card>
      </div>

      {/* Main Charts Layout */}
      <div
        className="charts-split-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <Card title="Monthly Trend (Past 30 Days)" tagName="section">
          <EmissionTrendChart data={[]} period="day" /> {/* Injected empty data handles defaults */}
        </Card>

        <Card title="Category Breakdown (This Month)" tagName="section">
          {categoryBreakdown.length > 0 ? (
            <CategoryBreakdownChart data={categoryBreakdown} />
          ) : (
            <p style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              No data logged this month.
            </p>
          )}
        </Card>
      </div>

      {/* Goals & Activities Split */}
      <div
        className="dashboard-lists-split"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <Card title="Active Goals" tagName="section">
          {activeGoals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            <p style={{ color: 'var(--text-muted)' }}>
              You have no active goals set. Set one to start tracking carbon reduction progress!
            </p>
          )}
        </Card>

        <Card title="Recent Activity Log" tagName="section">
          {recentActivities.length > 0 ? (
            <ul
              className="dashboard-activity-list"
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {recentActivities.map((act) => (
                <li
                  key={act._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600 }}>{act.subcategory}</p>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {act.category.toUpperCase()} &bull; {formatDate(act.date)}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                    +{formatCarbonValue(act.carbonKg)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No activities logged yet.</p>
          )}
        </Card>
      </div>

      {/* Environmental Equivalencies Card */}
      <Card
        title="Your Carbon Equivalencies (Monthly Footprint)"
        tagName="section"
        className="equivalences-card"
      >
        <div
          className="equivalences-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            textAlign: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '2.5rem' }} aria-hidden="true">
              🌳
            </span>
            <p style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0.5rem 0' }}>
              {treesEquivalent}
            </p>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Trees required to offset this footprint
            </span>
          </div>
          <div>
            <span style={{ fontSize: '2.5rem' }} aria-hidden="true">
              🚗
            </span>
            <p style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0.5rem 0' }}>
              {carKmEquivalent} km
            </p>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Passenger car driving distance equivalent
            </span>
          </div>
          <div>
            <span style={{ fontSize: '2.5rem' }} aria-hidden="true">
              💡
            </span>
            <p style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0.5rem 0' }}>
              {electricityKwhEquivalent} kWh
            </p>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Electricity usage carbon equivalent
            </span>
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
