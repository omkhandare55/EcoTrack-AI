import request from 'supertest';
import app from '../../app';
import * as dbHandler from '../dbHandler';
import { Challenge } from '../../models/Challenge';

beforeAll(async () => await dbHandler.connect(), 300000);
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Features API (Analytics, Goals, Challenges, Recommendations) Integration Tests', () => {
  let cookie: string;

  beforeEach(async () => {
    // Register test user and get cookie
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123',
    });
    cookie = regRes.headers['set-cookie'][0];
  });

  describe('Goals API', () => {
    it('should successfully create, get, update, and delete goals', async () => {
      const goalData = {
        title: 'Reduce transportation emissions',
        category: 'transportation',
        targetReduction: 15,
        period: 'weekly',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
      };

      // 1. Create Goal
      const createRes = await request(app)
        .post('/api/v1/goals')
        .set('Cookie', [cookie])
        .send(goalData);

      expect(createRes.status).toBe(201);
      expect(createRes.body.status).toBe('success');
      expect(createRes.body.data.goal).toBeDefined();
      expect(createRes.body.data.goal.title).toBe(goalData.title);

      const goalId = createRes.body.data.goal._id;

      // 2. Get Goals
      const getRes = await request(app).get('/api/v1/goals').set('Cookie', [cookie]);

      expect(getRes.status).toBe(200);
      expect(getRes.body.status).toBe('success');
      expect(getRes.body.data.goals).toHaveLength(1);
      expect(getRes.body.data.goals[0]._id).toBe(goalId);

      // 3. Update Goal
      const updateRes = await request(app)
        .patch(`/api/v1/goals/${goalId}`)
        .set('Cookie', [cookie])
        .send({
          title: 'Updated Goal Title',
          targetReduction: 20,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.status).toBe('success');
      expect(updateRes.body.data.goal.title).toBe('Updated Goal Title');
      expect(updateRes.body.data.goal.targetReduction).toBe(20);

      // 4. Delete Goal
      const deleteRes = await request(app)
        .delete(`/api/v1/goals/${goalId}`)
        .set('Cookie', [cookie]);

      expect(deleteRes.status).toBe(204);

      // Verify deleted
      const verifyRes = await request(app).get('/api/v1/goals').set('Cookie', [cookie]);
      expect(verifyRes.body.data.goals).toHaveLength(0);
    });
  });

  describe('Challenges API', () => {
    it('should retrieve active challenges, get progress, and complete a challenge', async () => {
      // Create a challenge directly in the database
      const challenge = await Challenge.create({
        title: 'Walk to work/school',
        description: 'Walk instead of driving for your commute today.',
        category: 'transportation',
        difficulty: 'easy',
        points: 50,
        estimatedSavingKg: 3.2,
        frequency: 'one-time',
        isActive: true,
      });

      // 1. Get available challenges
      const challengesRes = await request(app).get('/api/v1/challenges').set('Cookie', [cookie]);

      expect(challengesRes.status).toBe(200);
      expect(challengesRes.body.status).toBe('success');
      expect(challengesRes.body.data.challenges).toHaveLength(1);
      expect(challengesRes.body.data.challenges[0].title).toBe(challenge.title);

      // 2. Complete challenge
      const completeRes = await request(app)
        .post(`/api/v1/challenges/${challenge._id}/complete`)
        .set('Cookie', [cookie]);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.status).toBe('success');
      expect(completeRes.body.data.progress.status).toBe('completed');
      expect(completeRes.body.data.progress.streak).toBe(1);

      // 3. Get challenge progress
      const progressRes = await request(app)
        .get('/api/v1/challenges/progress')
        .set('Cookie', [cookie]);

      expect(progressRes.status).toBe(200);
      expect(progressRes.body.status).toBe('success');
      expect(progressRes.body.data.progress).toHaveLength(1);
      expect(progressRes.body.data.progress[0].challengeId._id).toBe(challenge._id.toString());

      // 4. Get leaderboard
      const leaderboardRes = await request(app)
        .get('/api/v1/challenges/leaderboard')
        .set('Cookie', [cookie]);

      expect(leaderboardRes.status).toBe(200);
      expect(leaderboardRes.body.status).toBe('success');
      expect(leaderboardRes.body.data.leaderboard).toBeDefined();
    });
  });

  describe('Analytics and Recommendations API', () => {
    beforeEach(async () => {
      // Log some activities to seed statistics
      await request(app).post('/api/v1/activities').set('Cookie', [cookie]).send({
        category: 'transportation',
        subcategory: 'car',
        value: 50,
        unit: 'km',
        date: new Date().toISOString(),
      });

      await request(app).post('/api/v1/activities').set('Cookie', [cookie]).send({
        category: 'electricity',
        subcategory: 'household',
        value: 120,
        unit: 'kWh',
        date: new Date().toISOString(),
      });
    });

    it('should retrieve correct summary and breakdowns', async () => {
      const res = await request(app).get('/api/v1/analytics/summary').set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalEmissions.thisMonth).toBeGreaterThan(0);
      expect(res.body.data.summary.categoryBreakdown).toBeDefined();
    });

    it('should retrieve trends data', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/trends?period=day&rangeDays=7')
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.trends).toBeDefined();
    });

    it('should retrieve category breakdown data', async () => {
      const res = await request(app).get('/api/v1/analytics/breakdown').set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.breakdown).toBeDefined();
      expect(res.body.data.breakdown.length).toBeGreaterThan(0);
    });

    it('should retrieve predictions data', async () => {
      const res = await request(app).get('/api/v1/analytics/predictions').set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.prediction).toBeDefined();
    });

    it('should retrieve historical comparisons', async () => {
      const res = await request(app).get('/api/v1/analytics/comparison').set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.comparison).toBeDefined();
    });

    it('should retrieve personalized recommendations', async () => {
      const res = await request(app).get('/api/v1/recommendations').set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.recommendations).toBeDefined();
      expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Achievements API', () => {
    it('should retrieve user achievements and trigger an check/award pass', async () => {
      const res = await request(app).get('/api/v1/achievements').set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.achievements).toBeDefined();
    });
  });
});
