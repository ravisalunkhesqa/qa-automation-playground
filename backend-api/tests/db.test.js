const test = require('node:test');
const assert = require('node:assert/strict');

const { getDbConfig } = require('../db');

test('getDbConfig returns the expected PostgreSQL settings', () => {
  const config = getDbConfig();

  assert.equal(config.host, process.env.DB_HOST);
  assert.equal(config.port, Number(process.env.DB_PORT || 5432));
  assert.equal(config.database, process.env.DB_NAME);
  assert.equal(config.user, process.env.DB_USER);
  assert.equal(config.password, process.env.DB_PASSWORD);
  assert.deepEqual(config.ssl, { rejectUnauthorized: false });
});
