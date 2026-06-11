import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { CategoryBreakdown } from '../../types';
import { formatCarbonValue, formatPercentage } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = React.memo(
  ({ data }) => {
    // Map categories to modern design theme colors
    const getColorForCategory = (category: string) => {
      const colors: Record<string, string> = {
        transportation: '#3b82f6', // blue
        electricity: '#f59e0b', // amber
        food: '#10b981', // emerald
        water: '#06b6d4', // cyan
        shopping: '#8b5cf6', // violet
      };
      return colors[category.toLowerCase()] || '#10b981';
    };

    const chartData = {
      labels: data.map((d) => d.category.charAt(0).toUpperCase() + d.category.slice(1)),
      datasets: [
        {
          data: data.map((d) => d.totalCarbonKg),
          backgroundColor: data.map((d) => getColorForCategory(d.category)),
          borderColor: '#111827', // Card/Page secondary BG for high-contrast border
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: '#f1f5f9',
            boxWidth: 15,
            padding: 15,
            font: {
              family: 'Inter, sans-serif',
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#f1f5f9',
          bodyColor: '#f1f5f9',
          borderColor: 'rgba(148,163,184,0.1)',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => {
              const val = context.raw as number;
              return ` ${formatCarbonValue(val)}`;
            },
          },
        },
      },
    };

    return (
      <div className="chart-wrapper">
        <div className="canvas-container" style={{ height: '260px', position: 'relative' }}>
          <Doughnut
            data={chartData}
            options={options}
            aria-label="Category emissions breakdown doughnut chart"
          />
        </div>

        <details className="chart-table-details">
          <summary className="chart-table-summary">
            View Data Table (Screen Reader Fallback)
          </summary>
          <table className="chart-data-table">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Emissions</th>
                <th scope="col">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.category}>
                  <td>{row.category.charAt(0).toUpperCase() + row.category.slice(1)}</td>
                  <td>{formatCarbonValue(row.totalCarbonKg)}</td>
                  <td>{formatPercentage(row.percentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    );
  },
);

CategoryBreakdownChart.displayName = 'CategoryBreakdownChart';
