const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('../src/config/database');

async function run() {
  await connectDB();

  // Load models so indexes are registered
  const DoctorAvailability = require('../src/models/DoctorAvailability');
  const DoctorBreak = require('../src/models/DoctorBreak');
  const BlockedSlot = require('../src/models/BlockedSlot');
  const Appointment = require('../src/models/Appointment');

  await Promise.all([
    DoctorAvailability.syncIndexes(),
    DoctorBreak.syncIndexes(),
    BlockedSlot.syncIndexes(),
    Appointment.syncIndexes(),
  ]);

  // eslint-disable-next-line no-console
  console.log('Scheduling indexes synced successfully.');
  process.exit(0);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Scheduling migration failed:', err);
  process.exit(1);
});

