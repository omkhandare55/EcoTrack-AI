import request from 'supertest';
import app from '../../app';
import * as dbHandler from '../dbHandler';
import User from '../../models/User';

beforeAll(async () => await dbHandler.connect(), 300000);
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Auth API Integration Tests', () => {
  const testUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password123',
  };

  it('should successfully register a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.headers['set-cookie']).toBeDefined();

    // Verify user created in DB
    const userInDb = await User.findOne({ email: testUser.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.name).toBe(testUser.name);
  });

  it('should fail registration if email is already taken', async () => {
    // Register once
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Register twice
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('fail');
  });

  it('should successfully login an existing user', async () => {
    // Register first
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Login
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fail login with incorrect password', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  it('should get current user profile when authenticated', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);

    const cookie = regRes.headers['set-cookie'][0];

    const profileRes = await request(app).get('/api/v1/auth/me').set('Cookie', [cookie]);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.status).toBe('success');
    expect(profileRes.body.data.user.email).toBe(testUser.email);
  });

  it('should fail to get profile when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
  });

  it('should clear cookies on logout', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);

    const cookie = regRes.headers['set-cookie'][0];

    const logoutRes = await request(app).post('/api/v1/auth/logout').set('Cookie', [cookie]);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers['set-cookie'][0]).toContain('token=;');
  });
});
