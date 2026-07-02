const mongoose = require('mongoose');
const request = require('supertest');

let app;

beforeAll(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vspm_test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  await mongoose.connect(uri);
  // Clear DB before tests
  await mongoose.connection.dropDatabase();
  app = require('../src/app');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Auth + basic flows', () => {
  test('first registered user becomes admin and can login', async () => {
    // Register first admin
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Admin', email: 'tadmin@test.local', password: 'password123', role: 'admin' })
      .expect(201);

    expect(reg.body).toBeDefined();
    expect(reg.body.message).toBe('User created');
    expect(reg.body.user).toBeDefined();

    // Login
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'tadmin@test.local', password: 'password123' })
      .expect(200);

    expect(login.body.token).toBeDefined();
    expect(login.body.user.email).toBe('tadmin@test.local');
  });
});
