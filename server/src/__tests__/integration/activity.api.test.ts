import request from 'supertest';
import app from '../../app';
import * as dbHandler from '../dbHandler';
import Activity from '../../models/Activity';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Activity API Integration Tests', () => {
  let cookie: string;
  let userId: string;

  beforeEach(async () => {
    // Register test user and get cookie
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123',
    });
    cookie = regRes.headers['set-cookie'][0];
    userId = regRes.body.data.user.id;
  });

  it('should successfully log a new activity', async () => {
    const activityData = {
      category: 'transportation',
      subcategory: 'car',
      value: 10,
      unit: 'km',
      date: new Date().toISOString(),
    };

    const res = await request(app)
      .post('/api/v1/activities')
      .set('Cookie', [cookie])
      .send(activityData);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.activity).toBeDefined();
    expect(res.body.data.activity.carbonKg).toBeGreaterThan(0);

    const activityInDb = await Activity.findOne({ userId });
    expect(activityInDb).not.toBeNull();
    expect(activityInDb?.value).toBe(10);
  });

  it('should fail if required fields are missing', async () => {
    const res = await request(app).post('/api/v1/activities').set('Cookie', [cookie]).send({
      category: 'transportation',
      // subcategory missing
      value: 10,
      unit: 'km',
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should retrieve list of activities', async () => {
    // Log two activities
    await request(app).post('/api/v1/activities').set('Cookie', [cookie]).send({
      category: 'transportation',
      subcategory: 'car',
      value: 10,
      unit: 'km',
      date: new Date().toISOString(),
    });

    await request(app).post('/api/v1/activities').set('Cookie', [cookie]).send({
      category: 'electricity',
      subcategory: 'household',
      value: 100,
      unit: 'kWh',
      date: new Date().toISOString(),
    });

    const res = await request(app).get('/api/v1/activities').set('Cookie', [cookie]);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it('should retrieve a single activity by ID', async () => {
    const logRes = await request(app).post('/api/v1/activities').set('Cookie', [cookie]).send({
      category: 'transportation',
      subcategory: 'car',
      value: 10,
      unit: 'km',
      date: new Date().toISOString(),
    });

    const activityId = logRes.body.data.activity._id;

    const res = await request(app).get(`/api/v1/activities/${activityId}`).set('Cookie', [cookie]);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.activity._id).toBe(activityId);
  });

  it('should delete an activity by ID', async () => {
    const logRes = await request(app).post('/api/v1/activities').set('Cookie', [cookie]).send({
      category: 'transportation',
      subcategory: 'car',
      value: 10,
      unit: 'km',
      date: new Date().toISOString(),
    });

    const activityId = logRes.body.data.activity._id;

    const deleteRes = await request(app)
      .delete(`/api/v1/activities/${activityId}`)
      .set('Cookie', [cookie]);

    expect(deleteRes.status).toBe(204);

    const activityInDb = await Activity.findById(activityId);
    expect(activityInDb).toBeNull();
  });
});
