process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vspm_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const { generateToken, verifyToken } = require('../src/utils/token');

describe('token util', () => {
  test('generate and verify token', () => {
    const t = generateToken({ id: '123', role: 'host' });
    expect(typeof t).toBe('string');
    const decoded = verifyToken(t);
    expect(decoded.id).toBe('123');
    expect(decoded.role).toBe('host');
  });
});
