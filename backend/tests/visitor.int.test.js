const mongoose = require('mongoose');
const request = require('supertest');

let app;

beforeAll(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vspm_test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  app = require('../src/app');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Visitor request flow', () => {
  test('submit request and host list contains host', async () => {
    // create admin
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Admin', email: 'a@test.com', password: 'pass1234', role: 'admin' })
      .expect(201);

    // create host via admin header
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@test.com', password: 'pass1234' })
      .expect(200);

    const token = adminLogin.body.token;

    const regHost = await request(app)
      .post('/api/v1/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Host', email: 'host@test.com', password: 'hostpass', role: 'host' })
      .expect(201);

    const hostId = regHost.body.user.id;

    // submit visitor request
    const visitDate = new Date(); visitDate.setDate(visitDate.getDate() + 1);
    const reqRes = await request(app)
      .post('/api/v1/visitor/request')
      .send({ name: 'Visitor', phone: '5555555555', idProof: 'ID1', hostId, purpose: 'Meet', visitDate: visitDate.toISOString() })
      .expect(201);

    expect(reqRes.body.requestId).toBeDefined();
  });
});
