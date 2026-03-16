const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

describe('Auth APIs', () => {
  test('POST /api/auth/signup creates user and stores 6-digit OTP', async () => {
    const suffix = uniqueSuffix();
    const email = `user.${suffix}@example.com`;
    const username = `user${suffix}`;
    const mobileNumber = String(9000000000 + (Number(suffix) % 999999999)).slice(0, 10);

    const res = await request(app).post('/api/auth/signup').send({
      fullName: 'Demo User',
      mobileNumber,
      email,
      username,
      password: 'Password@1',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('emailSent');

    const dbUser = await User.findOne({ email }).select('+otp +otpExpires');
    expect(dbUser).toBeTruthy();
    expect(dbUser.isVerified).toBe(false);
    expect(dbUser.otp).toMatch(/^\d{6}$/);
    expect(dbUser.otpExpires).toBeInstanceOf(Date);
  });

  test('POST /api/auth/signup/verify verifies OTP and allows login OTP flow', async () => {
    const suffix = uniqueSuffix();
    const email = `verify.${suffix}@example.com`;
    const username = `verify${suffix}`;
    const mobileNumber = String(9100000000 + (Number(suffix) % 899999999)).slice(0, 10);

    const signupRes = await request(app).post('/api/auth/signup').send({
      fullName: 'Verify User',
      mobileNumber,
      email,
      username,
      password: 'Password@1',
    });
    expect(signupRes.statusCode).toBe(201);

    const dbUser = await User.findOne({ email }).select('+otp +otpExpires');
    const otp = dbUser.otp;

    const verifyRes = await request(app).post('/api/auth/signup/verify').send({
      identifier: email,
      otp,
    });
    expect(verifyRes.statusCode).toBe(200);

    const verifiedUser = await User.findOne({ email }).select('+otp +otpExpires');
    expect(verifiedUser.isVerified).toBe(true);
    expect(verifiedUser.otp).toBeFalsy();
    expect(verifiedUser.otpExpires).toBeFalsy();

    const loginRes = await request(app).post('/api/auth/login').send({
      identifier: email,
      password: 'Password@1',
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('emailSent');

    const loginOtpUser = await User.findOne({ email }).select('+otp +otpExpires');
    expect(loginOtpUser.otp).toMatch(/^\d{6}$/);

    const loginVerifyRes = await request(app).post('/api/auth/login/verify').send({
      identifier: email,
      otp: loginOtpUser.otp,
    });
    expect(loginVerifyRes.statusCode).toBe(200);
    expect(loginVerifyRes.body).toHaveProperty('token');
    expect(loginVerifyRes.body).toHaveProperty('user');
  });

  test('forgot-password flow resets password', async () => {
    const suffix = uniqueSuffix();
    const email = `forgot.${suffix}@example.com`;
    const username = `forgot${suffix}`;
    const mobileNumber = String(9200000000 + (Number(suffix) % 799999999)).slice(0, 10);

    await request(app).post('/api/auth/signup').send({
      fullName: 'Forgot User',
      mobileNumber,
      email,
      username,
      password: 'Password@1',
    });

    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ username });
    expect(forgotRes.statusCode).toBe(200);
    expect(forgotRes.body).toHaveProperty('emailSent');

    const forgotUser = await User.findOne({ username }).select('+otp +otpExpires');
    expect(forgotUser.otp).toMatch(/^\d{6}$/);

    const newPassword = 'Newpass@1';
    const verifyRes = await request(app).post('/api/auth/forgot-password/verify').send({
      username,
      otp: forgotUser.otp,
      newPassword,
    });
    expect(verifyRes.statusCode).toBe(200);

    const nowVerified = await User.findOne({ username });
    expect(nowVerified.isVerified).toBe(true);

    const loginRes = await request(app).post('/api/auth/login').send({
      identifier: username,
      password: newPassword,
    });
    expect(loginRes.statusCode).toBe(200);
  });
});

