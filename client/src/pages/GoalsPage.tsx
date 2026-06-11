import React, { useState } from 'react';
import { useGoals, useDeleteGoal } from '../hooks/useGoals';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import { Alert } from '../components/common/Alert';
import { GoalForm } from '../components/forms/GoalForm';
import { GoalProgressChart } from '../components/charts/GoalProgressChart';
import { formatDate, formatPercentage } from '../utils/formatters';

export const GoalsPage: React.FC = () => {
  const { data: goals, isLoading, isError, refetch } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sustainability goal?')) {
      try {
        await deleteGoalMutation.mutateAsync(id);
        setSuccessMsg('Goal removed successfully.');
        refetch();
      } catch (err: any) {
        console.error('Delete goal failed:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spinner size="lg" label="Retrieving carbon reduction goals..." />
      </div>
    );
  }

  if (isError || !goals) {
    return (
      <Alert type="error" message="Failed to load goals. Please refresh or try again later." />
    );
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed' || g.status === 'failed');

  return (
    <div className="goals-page-container">
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
            Sustainability Goals
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Set, track, and hit carbon reduction milestones.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <span aria-hidden="true" style={{ marginRight: '8px' }}>
            +
          </span>{' '}
          Set Goal
        </Button>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}

      {/* Active Goals Section */}
      <div className="goals-section" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          Active Targets
        </h2>

        {activeGoals.length > 0 ? (
          <div
            className="active-goals-list"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {activeGoals.map((goal) => (
              <Card key={goal._id} tagName="section" className="goal-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{goal.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Category: {goal.category.toUpperCase()} &bull; Period:{' '}
                      {goal.period.toUpperCase()}
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(goal._id)}
                    ariaLabel={`Delete goal ${goal.title}`}
                  >
                    Remove
                  </Button>
                </div>

                <GoalProgressChart
                  label="Target Reduction"
                  current={goal.currentValue}
                  target={goal.targetReduction}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginTop: '1rem',
                  }}
                >
                  <span>Baseline footprint: {goal.baselineValue.toFixed(1)} kg CO₂</span>
                  <span>Target end: {formatDate(goal.endDate)}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3.5rem' }} aria-hidden="true">
              🎯
            </span>
            <p style={{ marginTop: '1rem' }}>
              No active goals. Commit to reducing carbon by setting a goal today!
            </p>
            <Button onClick={() => setIsModalOpen(true)} style={{ marginTop: '1rem' }}>
              Set Your First Goal
            </Button>
          </div>
        )}
      </div>

      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <div className="goals-section">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Completed &amp; Past Targets
          </h2>
          <div
            className="completed-goals-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {completedGoals.map((goal) => (
              <Card
                key={goal._id}
                tagName="section"
                style={{
                  borderLeft:
                    goal.status === 'completed'
                      ? '4px solid var(--success)'
                      : '4px solid var(--danger)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{goal.title}</h3>
                  <span
                    className={`badge ${goal.status === 'completed' ? 'badge-success' : 'badge-danger'}`}
                  >
                    {goal.status.toUpperCase()}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    margin: '0.25rem 0 1rem 0',
                  }}
                >
                  {goal.category.toUpperCase()} &bull; Ended {formatDate(goal.endDate)}
                </p>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                  Achieved: <strong>{formatPercentage(goal.currentValue)}</strong> of{' '}
                  {formatPercentage(goal.targetReduction)} target
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Set Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Carbon Reduction Goal"
      >
        <GoalForm
          onSuccess={() => {
            setIsModalOpen(false);
            setSuccessMsg('Goal set successfully!');
            refetch();
          }}
        />
      </Modal>
    </div>
  );
};

export default GoalsPage;
