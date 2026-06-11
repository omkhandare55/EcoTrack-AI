import React, { useState, useEffect } from 'react';
import { useCreateActivity } from '../../hooks/useActivities';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { ACTIVITY_CATEGORIES } from '../../constants';
import type { ActivityCategory } from '../../types';

// Subcategories and their standard units
const SUBCATEGORIES: Record<string, { label: string; unit: string }[]> = {
  transportation: [
    { label: 'Car', unit: 'km' },
    { label: 'Bus', unit: 'km' },
    { label: 'Train', unit: 'km' },
    { label: 'Airplane', unit: 'km' },
    { label: 'Bicycle', unit: 'km' },
    { label: 'Walking', unit: 'km' },
    { label: 'Motorcycle', unit: 'km' },
  ],
  electricity: [{ label: 'Grid Electricity', unit: 'kWh' }],
  food: [
    { label: 'Beef', unit: 'kg' },
    { label: 'Chicken', unit: 'kg' },
    { label: 'Fish', unit: 'kg' },
    { label: 'Vegetables', unit: 'kg' },
    { label: 'Dairy', unit: 'kg' },
    { label: 'Grains', unit: 'kg' },
  ],
  water: [
    { label: 'Shower/Bath', unit: 'liters' },
    { label: 'Tap Water Usage', unit: 'liters' },
    { label: 'Washing Machine', unit: 'liters' },
  ],
  shopping: [
    { label: 'Clothing/Apparel', unit: 'items' },
    { label: 'Electronics', unit: 'items' },
    { label: 'Furniture/Household', unit: 'items' },
  ],
};

interface ActivityFormProps {
  onSuccess: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ onSuccess }) => {
  const createActivityMutation = useCreateActivity();

  const [category, setCategory] = useState<string>('transportation');
  const [subcategory, setSubcategory] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('km');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update subcategories when category changes
  useEffect(() => {
    const list = SUBCATEGORIES[category] || [];
    const firstItem = list[0];
    if (firstItem) {
      setSubcategory(firstItem.label);
      setUnit(firstItem.unit);
    } else {
      setSubcategory('');
      setUnit('');
    }
  }, [category]);

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedLabel = e.target.value;
    setSubcategory(selectedLabel);

    // Auto-set the correct unit
    const matched = SUBCATEGORIES[category]?.find((sub) => sub.label === selectedLabel);
    if (matched) {
      setUnit(matched.unit);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setErrorMsg('Please enter a positive numeric value.');
      return;
    }

    try {
      await createActivityMutation.mutateAsync({
        category: category as ActivityCategory,
        subcategory,
        value: numericValue,
        unit,
        date: new Date(date).toISOString(),
      });
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || 'Failed to log activity. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="activity-form-container">
      {errorMsg && <Alert type="error" message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

      <div className="input-group">
        <label htmlFor="form-category" className="input-label">
          Category <span className="label-required">*</span>
        </label>
        <select
          id="form-category"
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

      <div className="input-group">
        <label htmlFor="form-subcategory" className="input-label">
          Subcategory <span className="label-required">*</span>
        </label>
        <select
          id="form-subcategory"
          className="input-field"
          value={subcategory}
          onChange={handleSubcategoryChange}
          required
        >
          {(SUBCATEGORIES[category] || []).map((sub) => (
            <option key={sub.label} value={sub.label}>
              {sub.label}
            </option>
          ))}
        </select>
      </div>

      <div className="input-row-grid">
        <Input
          label={`Amount (${unit})`}
          name="value"
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Enter quantity in ${unit}`}
          required
        />
      </div>

      <Input
        label="Date"
        name="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <div className="form-submit-container" style={{ marginTop: '1.5rem' }}>
        <Button
          type="submit"
          isLoading={createActivityMutation.isPending}
          disabled={createActivityMutation.isPending}
          style={{ width: '100%' }}
        >
          Log Activity
        </Button>
      </div>
    </form>
  );
};
