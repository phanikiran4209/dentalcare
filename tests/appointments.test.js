const request = require('supertest');
const app = require('../src/server');
const { createAdminAndLogin } = require('./helpers/auth');
const DoctorAvailability = require('../src/models/DoctorAvailability');

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

describe('Appointments', () => {
  test('Public create + admin list/update/delete', async () => {
    const suffix = uniqueSuffix();
    const date = '2026-03-12';
    const time = '10:00';
    const { token, admin } = await createAdminAndLogin();

    // Create weekly availability for the booking day (dynamic slot generation)
    await DoctorAvailability.findOneAndUpdate(
      { doctorId: admin._id, dayOfWeek: 'Thursday' },
      { $set: { doctorId: admin._id, dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00', slotDuration: 30 } },
      { upsert: true, new: true }
    );

    const createRes = await request(app).post('/api/appointments').send({
      name: 'Demo Patient',
      email: `patient.${suffix}@example.com`,
      phone: '9999999999',
      service: 'Cleaning',
      doctor_id: String(admin._id),
      date,
      time,
      message: 'Need appointment',
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty('_id');

    const id = createRes.body._id;

    const listRes = await request(app)
      .get('/api/appointments/admin')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const updateRes = await request(app)
      .put(`/api/appointments/admin/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toHaveProperty('status', 'approved');

    const deleteRes = await request(app)
      .delete(`/api/appointments/admin/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
  });
});

