process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vspm_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const passcode = require('../src/utils/passcode');

describe('passcode utility', () => {
  test('generate returns a string with PASS-', () => {
    const code = passcode.generate();
    expect(typeof code).toBe('string');
    expect(code.startsWith('PASS-')).toBe(true);
  });
});
