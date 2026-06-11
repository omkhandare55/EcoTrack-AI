import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { achievementService } from '../services/achievementService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Spinner } from '../components/common/Spinner';
import { formatDate } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [units, setUnits] = useState<'metric' | 'imperial'>(user?.preferences?.units || 'metric');
  const [notifications, setNotifications] = useState<boolean>(
    user?.preferences?.notifications ?? true,
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch achievements
  const {
    data: achievements,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementService.getAchievements(),
    staleTime: 5 * 60 * 1000,
  });

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Preferences updated successfully (simulation).');
  };

  return (
    <div className="profile-page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
          Account &amp; Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your footprint preferences and track your eco achievements.
        </p>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}

      <div
        className="profile-grid-layout"
        style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}
      >
        {/* Left: User Details & Preferences */}
        <div
          className="profile-left-column"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <Card title="User Details" tagName="section">
            {user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NAME</span>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>{user.name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>EMAIL</span>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>{user.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ACCOUNT STATUS
                  </span>
                  <p style={{ fontWeight: 600, color: 'var(--success)', margin: 0 }}>Active</p>
                </div>
              </div>
            )}
          </Card>

          <Card title="Preferences" tagName="section">
            <form
              onSubmit={handlePreferencesSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div className="input-group">
                <label htmlFor="pref-units" className="input-label">
                  Measurement System
                </label>
                <select
                  id="pref-units"
                  className="input-field"
                  value={units}
                  onChange={(e) => setUnits(e.target.value as any)}
                >
                  <option value="metric">Metric (kg, km, liters)</option>
                  <option value="imperial">Imperial (lbs, miles, gallons)</option>
                </select>
              </div>

              <div
                className="checkbox-group"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <input
                  type="checkbox"
                  id="pref-notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="pref-notifications" className="input-label" style={{ margin: 0 }}>
                  Enable carbon alerts &amp; weekly report notifications
                </label>
              </div>

              <Button type="submit" style={{ marginTop: '0.5rem' }}>
                Save Preferences
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Unlocked Achievements and Milestones */}
        <div className="profile-right-column">
          <Card title="Unlocked Achievements &amp; Badges" tagName="section">
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Spinner size="md" label="Loading achievements..." />
              </div>
            ) : isError ? (
              <Alert type="error" message="Failed to load achievements list." />
            ) : achievements && achievements.length > 0 ? (
              <div
                className="badges-profile-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '1.5rem',
                  textAlign: 'center',
                }}
              >
                {achievements.map((ach) => (
                  <div
                    key={ach._id}
                    className="profile-badge-item"
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '2.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '0.75rem',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem auto',
                      }}
                      aria-label={`Badge icon: ${ach.title}`}
                    >
                      🏅
                    </span>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                      {ach.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        margin: '0 0 0.5rem 0',
                        minHeight: '36px',
                      }}
                    >
                      {ach.description}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Earned {formatDate(ach.earnedAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '3rem' }} aria-hidden="true">
                  🏅
                </span>
                <p style={{ marginTop: '1rem' }}>
                  No badges unlocked yet. Keep tracking carbon footprints and hit goals to claim
                  awards!
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
