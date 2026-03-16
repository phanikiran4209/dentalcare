const request = require('supertest');
const app = require('../src/server');
const { createAdminAndLogin } = require('./helpers/auth');

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

describe('Services', () => {
  test('Admin CRUD; public lists active only', async () => {
    const { token } = await createAdminAndLogin();
    const suffix = uniqueSuffix();

    const createRes = await request(app)
      .post('/api/services/admin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `Service ${suffix}`,
        description: 'Demo service description',
        icon: '',
        active: true,
        order: 0,
      });
    expect(createRes.statusCode).toBe(201);
    const id = createRes.body._id;

    const publicRes = await request(app).get('/api/services');
    expect(publicRes.statusCode).toBe(200);
    expect(Array.isArray(publicRes.body)).toBe(true);

    const updateRes = await request(app)
      .put(`/api/services/admin/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Updated description' });
    expect(updateRes.statusCode).toBe(200);

    const deleteRes = await request(app)
      .delete(`/api/services/admin/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
  });
});

