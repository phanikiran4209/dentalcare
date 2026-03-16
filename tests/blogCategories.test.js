const request = require('supertest');
const app = require('../src/server');
const { createAdminAndLogin } = require('./helpers/auth');

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

describe('Blog Categories', () => {
  test('Admin can CRUD; public can list', async () => {
    const { token } = await createAdminAndLogin();
    const suffix = uniqueSuffix();

    const createRes = await request(app)
      .post('/api/blog-categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Category ${suffix}`, slug: `category-${suffix}`, description: 'Demo', active: true, order: 1 });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty('_id');
    const id = createRes.body._id;

    const publicList = await request(app).get('/api/blog-categories');
    expect(publicList.statusCode).toBe(200);
    expect(Array.isArray(publicList.body)).toBe(true);

    const updateRes = await request(app)
      .put(`/api/blog-categories/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Updated' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toHaveProperty('description', 'Updated');

    const deleteRes = await request(app)
      .delete(`/api/blog-categories/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
  });
});

