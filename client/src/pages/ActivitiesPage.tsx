import React, { useState } from 'react';
import { useActivities, useDeleteActivity } from '../hooks/useActivities';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import { Alert } from '../components/common/Alert';
import { Pagination } from '../components/common/Pagination';
import { ActivityForm } from '../components/forms/ActivityForm';
import { formatCarbonValue, formatDate } from '../utils/formatters';
import { ACTIVITY_CATEGORIES } from '../constants';

export const ActivitiesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    data: activitiesData,
    isLoading,
    isError,
    refetch,
  } = useActivities({
    page,
    limit: 10,
    category: category || undefined,
  });

  const deleteActivityMutation = useDeleteActivity();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivityMutation.mutateAsync(id);
        setSuccessMsg('Activity deleted successfully.');
        refetch();
      } catch (err: any) {
        console.error('Delete activity failed:', err);
      }
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1); // Reset page on filter change
  };

  return (
    <div className="activities-page-container">
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
            Carbon Activities Log
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Log and filter activities contributing to your footprint.
          </p>
        </div>
        <Button onClick={() => setIsLogModalOpen(true)}>
          <span aria-hidden="true" style={{ marginRight: '8px' }}>
            +
          </span>{' '}
          Log Activity
        </Button>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}

      {/* Filter Options */}
      <Card tagName="section" className="filter-card" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="input-group" style={{ margin: 0, flex: 1 }}>
            <label htmlFor="filter-category" className="input-label sr-only">
              Filter by Category
            </label>
            <select
              id="filter-category"
              className="input-field"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {ACTIVITY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Content / Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size="lg" label="Fetching activities log..." />
        </div>
      ) : isError ? (
        <Alert
          type="error"
          message="Failed to load activities. Please refresh or try again later."
        />
      ) : activitiesData && activitiesData.data.length > 0 ? (
        <Card tagName="section" className="activities-table-card">
          <div className="table-responsive">
            <table className="activities-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Category</th>
                  <th scope="col">Subcategory</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Carbon Footprint</th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {activitiesData.data.map((act) => (
                  <tr key={act._id}>
                    <td>{formatDate(act.date)}</td>
                    <td>
                      <span className={`badge badge-cat-${act.category}`}>
                        {act.category.charAt(0).toUpperCase() + act.category.slice(1)}
                      </span>
                    </td>
                    <td>{act.subcategory}</td>
                    <td>
                      {act.value} {act.unit}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>
                      {formatCarbonValue(act.carbonKg)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(act._id)}
                        ariaLabel={`Delete log for ${act.subcategory}`}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              currentPage={activitiesData.page}
              totalPages={activitiesData.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </Card>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem' }} aria-hidden="true">
            💨
          </span>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
            No activities logged for the selected filter.
          </p>
          <Button onClick={() => setIsLogModalOpen(true)} style={{ marginTop: '1rem' }}>
            Log Your First Activity
          </Button>
        </div>
      )}

      {/* Log Activity Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log New Carbon Footprint Activity"
      >
        <ActivityForm
          onSuccess={() => {
            setIsLogModalOpen(false);
            setSuccessMsg('Activity logged successfully!');
            refetch();
          }}
        />
      </Modal>
    </div>
  );
};

export default ActivitiesPage;
