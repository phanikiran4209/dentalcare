const request = require('supertest');
const app = require('../src/server');
const { createAdminAndLogin } = require('./helpers/auth');

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

describe('Contact', () => {
  test('Public create + admin list/reply/delete', async () => {
    const suffix = uniqueSuffix();
    const createRes = await request(app).post('/api/contact').send({
      name: 'Demo Visitor',
      email: `visitor.${suffix}@example.com`,
      phone: '8888888888',
      message: 'Hello, this is a demo message.',
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty('_id');

    const id = createRes.body._id;

    const { token } = await createAdminAndLogin();
    const listRes = await request(app)
      .get('/api/contact/admin')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.statusCode).toBe(200);

    const replyRes = await request(app)
      .post(`/api/contact/admin/${id}/reply`)
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Demo reply', reply: '<p>Thanks</p>' });
    expect(replyRes.statusCode).toBe(200);

    const deleteRes = await request(app)
      .delete(`/api/contact/admin/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
  });
});

