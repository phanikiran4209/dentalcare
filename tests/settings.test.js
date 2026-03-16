const request = require('supertest');
const app = require('../src/server');
const { createAdminAndLogin } = require('./helpers/auth');

describe('Settings', () => {
  test('Public GET returns object; admin PUT upserts', async () => {
    const publicRes1 = await request(app).get('/api/settings');
    expect(publicRes1.statusCode).toBe(200);
    expect(typeof publicRes1.body).toBe('object');

    const { token } = await createAdminAndLogin();
    const payload = {
      clinicName: 'Demo Dental Clinic',
      tagline: 'Smile brighter',
      contactEmail: 'demo@example.com',
      contactPhone: '9999999999',
      address: 'Demo address',
      mapEmbedUrl: 'https://example.com/map',
      hero: { title: 'Welcome', subtitle: 'Demo', ctaText: 'Book', ctaLink: '/book' },
      about: { heading: 'About', content: 'Demo', dentistName: 'Dr Demo', dentistQualifications: 'BDS' },
    };

    const upsertRes = await request(app)
      .put('/api/settings/admin')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(upsertRes.statusCode).toBe(200);
    expect(upsertRes.body).toHaveProperty('clinicName', payload.clinicName);

    const publicRes2 = await request(app).get('/api/settings');
    expect(publicRes2.statusCode).toBe(200);
    expect(publicRes2.body).toHaveProperty('clinicName', payload.clinicName);
  });
});

