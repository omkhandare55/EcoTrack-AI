import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useChallenges,
  useChallengeProgress,
  useCompleteChallenge,
  useLeaderboard,
} from '../hooks/useChallenges';
import { achievementService } from '../services/achievementService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { Alert } from '../components/common/Alert';
import { formatCarbonValue } from '../utils/formatters';

export const ChallengesPage: React.FC = () => {
  const {
    data: challenges,
    isLoading: isChallengesLoading,
    isError: isChallengesError,
  } = useChallenges();
  const { data: progressList, isLoading: isProgressLoading } = useChallengeProgress();
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useLeaderboard(5);
  const completeChallengeMutation = useCompleteChallenge();

  // Query achievements
  const { data: achievements, isLoading: isAchievementsLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementService.getAchievements(),
    staleTime: 2 * 60 * 1000,
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleComplete = async (challengeId: string) => {
    try {
      await completeChallengeMutation.mutateAsync(challengeId);
      setSuccessMsg('Challenge marked as completed! Points awarded!');
    } catch (err: any) {
      console.error('Failed to complete challenge:', err);
    }
  };

  const isLoading =
    isChallengesLoading || isProgressLoading || isLeaderboardLoading || isAchievementsLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spinner size="lg" label="Loading challenges and leaderboard..." />
      </div>
    );
  }

  if (isChallengesError || !challenges) {
    return (
      <Alert type="error" message="Failed to load challenges. Please refresh or try again later." />
    );
  }

  // Map progress statuses
  const getProgressForChallenge = (challengeId: string) => {
    return progressList?.find((p) => p.challengeId === challengeId);
  };

  return (
    <div className="challenges-page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
          Smart Eco Challenges
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Compete in daily &amp; weekly challenges, earn badges, and climb the leaderboard.
        </p>
      </div>

      {successMsg && (
        <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}

      <div
        className="challenges-grid-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        {/* Left: Active and Available Challenges */}
        <div className="challenges-left-column">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Active &amp; Available Challenges
          </h2>
          <div
            className="challenges-list"
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {challenges.map((ch) => {
              const progress = getProgressForChallenge(ch._id);
              const isCompleted = progress?.status === 'completed';

              return (
                <Card
                  key={ch._id}
                  tagName="section"
                  className={`challenge-card ${isCompleted ? 'challenge-completed' : ''}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span className={`badge badge-diff-${ch.difficulty}`}>
                          {ch.difficulty.toUpperCase()}
                        </span>
                        <span className="badge badge-freq">{ch.frequency.toUpperCase()}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                        {ch.title}
                      </h3>
                      <p
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem',
                          margin: '0.5rem 0',
                        }}
                      >
                        {ch.description}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span>
                          Award: <strong>{ch.points} Points</strong>
                        </span>
                        <span>
                          Potential offset:{' '}
                          <strong>{formatCarbonValue(ch.estimatedSavingKg)}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {isCompleted ? (
                        <span
                          style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}
                        >
                          ✓ COMPLETED
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleComplete(ch._id)}
                          isLoading={completeChallengeMutation.isPending}
                          disabled={completeChallengeMutation.isPending}
                        >
                          Complete
                        </Button>
                      )}
                      {progress && progress.streak > 0 && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--warning)',
                            marginTop: '0.5rem',
                          }}
                        >
                          🔥 {progress.streak} Day Streak
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Leaderboard & Badges */}
        <div
          className="challenges-right-column"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Leaderboard */}
          <Card title="Eco Leaderboard" tagName="section">
            {leaderboard && leaderboard.length > 0 ? (
              <table
                className="leaderboard-table"
                style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th scope="col" style={{ paddingBottom: '0.5rem' }}>
                      Rank
                    </th>
                    <th scope="col" style={{ paddingBottom: '0.5rem' }}>
                      User
                    </th>
                    <th scope="col" style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom:
                          idx < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <td style={{ padding: '0.75rem 0' }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </td>
                      <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{user.name}</td>
                      <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 700 }}>
                        {user.points || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No leaderboard records available.
              </p>
            )}
          </Card>

          {/* Badges achievements */}
          <Card title="Earned Badges" tagName="section">
            {achievements && achievements.length > 0 ? (
              <div
                className="badges-list"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}
              >
                {achievements.map((ach) => (
                  <div
                    key={ach._id}
                    className="badge-item-container"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '80px',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '2rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label={`Badge: ${ach.title}`}
                    >
                      🏅
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                        display: 'block',
                        fontWeight: 600,
                      }}
                    >
                      {ach.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Log actions and hit targets to unlock achievement badges!
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;
