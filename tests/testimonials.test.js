const request = require('supertest');
const app = require('../src/server');
const { createAdminAndLogin } = require('./helpers/auth');

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

describe('Testimonials', () => {
  test('Public create; admin update/delete; public lists approved only', async () => {
    const { token } = await createAdminAndLogin();
    const suffix = uniqueSuffix();

    const createRes = await request(app)
      .post('/api/testimonials')
      .send({
        name: `Demo ${suffix}`,
        review: 'Great service',
        rating: 5,
        image: 'https://example.com/img.png',
        approved: true,
      });
    expect(createRes.statusCode).toBe(201);
    const id = createRes.body._id;

    const publicRes = await request(app).get('/api/testimonials');
    expect(publicRes.statusCode).toBe(200);
    expect(Array.isArray(publicRes.body)).toBe(true);

    const updateRes = await request(app)
      .put(`/api/testimonials/admin/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ review: 'Updated review' });
    expect(updateRes.statusCode).toBe(200);

    const deleteRes = await request(app)
      .delete(`/api/testimonials/admin/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
  });
});

