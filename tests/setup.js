const mongoose = require('mongoose');
require('dotenv').config();

const DB_NAME = process.env.MONGODB_TEST_DB_NAME || 'dental_test';

function buildTestMongoUri(baseUri, dbName) {
  if (!baseUri) throw new Error('MONGODB_URI is required to run tests');

  const url = new URL(baseUri);
  url.pathname = `/${dbName}`;
  return url.toString();
}

async function clearDatabase() {
  const collections = mongoose.connection.collections;
  const names = Object.keys(collections);
  for (const name of names) {
    await collections[name].deleteMany({});
  }
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  const uri = buildTestMongoUri(process.env.MONGODB_URI, DB_NAME);
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 20000,
    maxPoolSize: 10,
  });

  await clearDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

