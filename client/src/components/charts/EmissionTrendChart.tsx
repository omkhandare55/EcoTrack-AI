import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { AnalyticsTrend } from '../../types';
import { formatCarbonValue } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface EmissionTrendChartProps {
  data: AnalyticsTrend[];
  period: 'day' | 'week' | 'month' | 'year';
}

export const EmissionTrendChart: React.FC<EmissionTrendChartProps> = React.memo(
  ({ data, period }) => {
    const chartData = {
      labels: data.map((d) => d.date),
      datasets: [
        {
          fill: true,
          label: 'Emissions (kg CO₂)',
          data: data.map((d) => d.totalCarbonKg),
          borderColor: '#10b981', // emerald-500
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          pointBackgroundColor: '#10b981',
          pointHoverBackgroundColor: '#10b981',
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
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
          <Line
            data={chartData}
            options={options}
            aria-label={`Carbon emissions trend line chart by ${period}`}
          />
        </div>

        {/* Screen Reader Fallback Data Table */}
        <details className="chart-table-details">
          <summary className="chart-table-summary">
            View Data Table (Screen Reader Fallback)
          </summary>
          <table className="chart-data-table">
            <thead>
              <tr>
                <th scope="col">Date/Period</th>
                <th scope="col">Total Emissions</th>
                <th scope="col">Entries Count</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{formatCarbonValue(row.totalCarbonKg)}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    );
  },
);

EmissionTrendChart.displayName = 'EmissionTrendChart';
