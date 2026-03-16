const request = require('supertest');
const Admin = require('../../src/models/Admin');
const app = require('../../src/server');

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

async function createAdminAndLogin() {
  const suffix = uniqueSuffix();
  const email = `admin.${suffix}@example.com`;
  const password = `AdminPass@${suffix}`;

  const admin = await Admin.create({ email, password, role: 'super_admin' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ identifier: email, password });

  if (res.statusCode !== 200 || !res.body || !res.body.token) {
    throw new Error(`Admin login failed: ${res.statusCode} ${JSON.stringify(res.body)}`);
  }

  return { token: res.body.token, email, password, admin };
}

module.exports = {
  createAdminAndLogin,
};

