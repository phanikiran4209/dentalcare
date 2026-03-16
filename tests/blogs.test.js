const request = require('supertest');
const app = require('../src/server');
const { createAdminAndLogin } = require('./helpers/auth');

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

describe('Blogs', () => {
  test('Admin CRUD works; authenticated list returns all blogs', async () => {
    const { token } = await createAdminAndLogin();
    const suffix = uniqueSuffix();

    const createRes = await request(app)
      .post('/api/blogs/admin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `Demo Blog ${suffix}`,
        slug: `demo-blog-${suffix}`,
        content: 'Hello world',
        published: true,
      });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty('_id');

    const id = createRes.body._id;
    const slug = createRes.body.slug;

    const updateRes = await request(app)
      .put(`/api/blogs/admin/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: `Updated ${suffix}` });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.title).toContain('Updated');

    const listRes = await request(app)
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const bySlugRes = await request(app).get(`/api/blogs/${slug}`);
    expect(bySlugRes.statusCode).toBe(200);
    expect(bySlugRes.body).toHaveProperty('slug', slug);

    const deleteRes = await request(app)
      .delete(`/api/blogs/admin/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
  });
});

