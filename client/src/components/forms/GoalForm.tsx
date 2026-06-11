import React, { useState } from 'react';
import { useCreateGoal } from '../../hooks/useGoals';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { ACTIVITY_CATEGORIES, GOAL_PERIODS } from '../../constants';

interface GoalFormProps {
  onSuccess: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSuccess }) => {
  const createGoalMutation = useCreateGoal();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('transportation');
  const [targetReduction, setTargetReduction] = useState('');
  const [period, setPeriod] = useState('weekly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericReduction = parseFloat(targetReduction);
    if (isNaN(numericReduction) || numericReduction <= 0 || numericReduction > 100) {
      setErrorMsg('Target reduction must be between 1% and 100%.');
      return;
    }

    if (endDate && new Date(endDate) <= new Date(startDate)) {
      setErrorMsg('End date must be after the start date.');
      return;
    }

    try {
      await createGoalMutation.mutateAsync({
        title,
        category: category as any,
        targetReduction: numericReduction,
        period: period as any,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create goal. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="goal-form-container">
      {errorMsg && <Alert type="error" message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

      <Input
        label="Goal Title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Reduce Car Travel, Veggie Commits"
        required
      />

      <div className="input-group">
        <label htmlFor="goal-category" className="input-label">
          Target Category <span className="label-required">*</span>
        </label>
        <select
          id="goal-category"
          className="input-field"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {ACTIVITY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Target CO₂ Reduction (%)"
        name="targetReduction"
        type="number"
        min="1"
        max="100"
        value={targetReduction}
        onChange={(e) => setTargetReduction(e.target.value)}
        placeholder="e.g. 15 for 15% reduction"
        required
      />

      <div className="input-group">
        <label htmlFor="goal-period" className="input-label">
          Tracking Period <span className="label-required">*</span>
        </label>
        <select
          id="goal-period"
          className="input-field"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          required
        >
          {GOAL_PERIODS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div
        className="input-row-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
      >
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          label="End Date (Optional)"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          helpText="Calculated automatically if omitted"
        />
      </div>

      <div className="form-submit-container" style={{ marginTop: '1.5rem' }}>
        <Button
          type="submit"
          isLoading={createGoalMutation.isPending}
          disabled={createGoalMutation.isPending}
          style={{ width: '100%' }}
        >
          Create Goal
        </Button>
      </div>
    </form>
  );
};
