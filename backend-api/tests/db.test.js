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

test('getDbConfig supports DATABASE_URL for local PostgreSQL connections', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/qa_automation';

  try {
    const config = getDbConfig();

    assert.equal(config.host, '127.0.0.1');
    assert.equal(config.port, 5432);
    assert.equal(config.database, 'qa_automation');
    assert.equal(config.user, 'postgres');
    assert.equal(config.password, 'postgres');
  } finally {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  }
});

test('getDbConfig supports SUPABASE_DB_URL for existing Supabase projects', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSupabaseDbUrl = process.env.SUPABASE_DB_URL;
  delete process.env.DATABASE_URL;
  process.env.SUPABASE_DB_URL = 'postgresql://postgres:secret@db.example.supabase.co:5432/postgres';

  try {
    const config = getDbConfig();

    assert.equal(config.host, 'db.example.supabase.co');
    assert.equal(config.port, 5432);
    assert.equal(config.database, 'postgres');
    assert.equal(config.user, 'postgres');
    assert.equal(config.password, 'secret');
    assert.deepEqual(config.ssl, { rejectUnauthorized: false });
  } finally {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }

    if (originalSupabaseDbUrl === undefined) {
      delete process.env.SUPABASE_DB_URL;
    } else {
      process.env.SUPABASE_DB_URL = originalSupabaseDbUrl;
    }
  }
});
