import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/shared/prisma';

describe('Auth Integration', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 409 if email already exists', async () => {
      await request(app).post('/api/auth/register').send({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'dupe@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'dupe@example.com',
          password: 'password123',
        })
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app).post('/api/auth/register').send({ firstName: '' }).expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      const registerRes = await request(app).post('/api/auth/register').send({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
      });

      const token = registerRes.body.data.token;

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);

      expect(res.body.data.email).toBe('jane@example.com');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);
      expect(res.body.success).toBe(false);
    });
  });
});
