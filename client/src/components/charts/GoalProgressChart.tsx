import React from 'react';
import { formatPercentage } from '../../utils/formatters';

interface GoalProgressChartProps {
  current: number; // current reduction percentage achieved
  target: number; // target reduction percentage
  label: string;
}

export const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ current, target, label }) => {
  // Clamped percentage between 0 and 100
  const progressPercent = Math.min(100, Math.max(0, (current / target) * 100));

  const isCompleted = current >= target;

  return (
    <div className="goal-progress-chart-wrapper">
      <div className="goal-progress-header">
        <span className="goal-progress-label">{label}</span>
        <span className="goal-progress-value">
          {formatPercentage(current)} achieved of {formatPercentage(target)} target
        </span>
      </div>

      <div
        className="goal-progress-track"
        role="progressbar"
        aria-valuenow={parseFloat(current.toFixed(1))}
        aria-valuemin={0}
        aria-valuemax={parseFloat(target.toFixed(1))}
        aria-label={`Progress of goal: ${label}`}
      >
        <div
          className={`goal-progress-fill ${isCompleted ? 'completed' : ''}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="goal-progress-footer">
        <span>0%</span>
        <span>{Math.round(progressPercent)}% of target met</span>
        <span>100%</span>
      </div>
    </div>
  );
};
