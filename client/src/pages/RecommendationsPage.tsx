import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recommendationService } from '../services/recommendationService';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { Alert } from '../components/common/Alert';
import { formatCarbonValue } from '../utils/formatters';

export const RecommendationsPage: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('');

  const {
    data: recommendations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationService.getRecommendations(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spinner size="lg" label="Computing personalized tips..." />
      </div>
    );
  }

  if (isError || !recommendations) {
    return (
      <Alert
        type="error"
        message="Failed to compute recommendations. Please refresh or try again later."
      />
    );
  }

  // Filter recommendations
  const filtered = filterCategory
    ? recommendations.filter((r) => r.category === filterCategory)
    : recommendations;

  // Compute total potential savings
  const totalSavings = filtered.reduce((sum, r) => sum + r.estimatedSavingKg, 0);

  const categories = ['transportation', 'electricity', 'food', 'water', 'shopping'];

  return (
    <div className="recommendations-page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
          Personalized Recommendations
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Custom tips generated based on your activity footprints to maximize carbon reduction.
        </p>
      </div>

      {/* Cumulative Savings Summary */}
      <Card
        tagName="section"
        className="savings-summary-card"
        style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--bg-card), rgba(16, 185, 129, 0.1))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Total Potential Savings
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                margin: '0.25rem 0 0 0',
              }}
            >
              Implement the recommendations below to reduce your footprint by this amount:
            </p>
          </div>
          <p
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--accent-primary)',
              margin: 0,
            }}
          >
            {formatCarbonValue(totalSavings)}
          </p>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div
        className="tab-switcher"
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          type="button"
          className={`btn ${filterCategory === '' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilterCategory('')}
          aria-label="Show all recommendations"
        >
          All Tips
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn ${filterCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCategory(cat)}
            aria-label={`Filter recommendations by ${cat}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      {filtered.length > 0 ? (
        <div
          className="recommendations-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map((rec, index) => (
            <Card
              key={index}
              tagName="section"
              className="recommendation-card"
              style={{
                borderLeft:
                  rec.priority === 'high'
                    ? '4px solid var(--danger)'
                    : rec.priority === 'medium'
                      ? '4px solid var(--warning)'
                      : '4px solid var(--success)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}
              >
                <span className={`badge badge-priority-${rec.priority}`}>
                  {rec.priority.toUpperCase()} PRIORITY
                </span>
                <span className={`badge badge-cat-${rec.category}`}>
                  {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                {rec.title}
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  margin: '0 0 1.5rem 0',
                }}
              >
                {rec.description}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Estimated monthly savings:</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>
                  -{formatCarbonValue(rec.estimatedSavingKg)}
                </strong>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem' }} aria-hidden="true">
            💡
          </span>
          <p style={{ marginTop: '1rem' }}>No recommendations found for the selected category.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
