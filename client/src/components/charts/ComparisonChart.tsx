import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCarbonValue, formatPercentage } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ComparisonChartProps {
  currentWeek: number;
  previousWeek: number;
  weekChange: number;
  currentMonth: number;
  previousMonth: number;
  monthChange: number;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = React.memo(
  ({ currentWeek, previousWeek, weekChange, currentMonth, previousMonth, monthChange }) => {
    const chartData = {
      labels: ['Weekly Emissions', 'Monthly Emissions'],
      datasets: [
        {
          label: 'Previous Period',
          data: [previousWeek, previousMonth],
          backgroundColor: '#4b5563', // gray-600
          borderColor: '#374151',
          borderWidth: 1,
        },
        {
          label: 'Current Period',
          data: [currentWeek, currentMonth],
          backgroundColor: '#10b981', // emerald-500
          borderColor: '#059669',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#f1f5f9',
          },
        },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#f1f5f9',
          bodyColor: '#f1f5f9',
          borderColor: 'rgba(148,163,184,0.1)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(148,163,184,0.05)',
          },
          ticks: {
            color: '#94a3b8',
          },
        },
        y: {
          grid: {
            color: 'rgba(148,163,184,0.05)',
          },
          ticks: {
            color: '#94a3b8',
          },
        },
      },
    };

    return (
      <div className="chart-wrapper">
        <div className="canvas-container" style={{ height: '300px', position: 'relative' }}>
          <Bar
            data={chartData}
            options={options}
            aria-label="Emissions period comparison bar chart"
          />
        </div>

        <details className="chart-table-details">
          <summary className="chart-table-summary">
            View Data Table (Screen Reader Fallback)
          </summary>
          <table className="chart-data-table">
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Previous Emissions</th>
                <th scope="col">Current Emissions</th>
                <th scope="col">Percentage Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Weekly</td>
                <td>{formatCarbonValue(previousWeek)}</td>
                <td>{formatCarbonValue(currentWeek)}</td>
                <td style={{ color: weekChange > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {weekChange > 0 ? '+' : ''}
                  {formatPercentage(weekChange)}
                </td>
              </tr>
              <tr>
                <td>Monthly</td>
                <td>{formatCarbonValue(previousMonth)}</td>
                <td>{formatCarbonValue(currentMonth)}</td>
                <td style={{ color: monthChange > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {monthChange > 0 ? '+' : ''}
                  {formatPercentage(monthChange)}
                </td>
              </tr>
            </tbody>
          </table>
        </details>
      </div>
    );
  },
);

ComparisonChart.displayName = 'ComparisonChart';
