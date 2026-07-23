const test = require('node:test');
const assert = require('node:assert/strict');

const { getDbConfig } = require('../db');

test('getDbConfig returns the expected PostgreSQL settings from DATABASE_URL', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgresql://postgres:secret@db.example.supabase.co:5432/postgres';

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

test('getDbConfig forces IPv4 resolution for Supabase-hosted connections', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSupabaseDbUrl = process.env.SUPABASE_DB_URL;
  delete process.env.DATABASE_URL;
  process.env.SUPABASE_DB_URL = 'postgresql://postgres:secret@db.example.supabase.co:5432/postgres';

  try {
    const config = getDbConfig();
    assert.equal(config.host, 'db.example.supabase.co');
    assert.equal(config.port, 5432);
    assert.equal(config.database, 'postgres');
    assert.equal(config.ssl.rejectUnauthorized, false);
    assert.equal(config.family, 4);
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

test('getDbConfig supports Vercel POSTGRES_* variables', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSupabaseDbUrl = process.env.SUPABASE_DB_URL;
  const originalPostgresUrl = process.env.POSTGRES_URL;
  const originalPostgresUser = process.env.POSTGRES_USER;
  const originalPostgresHost = process.env.POSTGRES_HOST;
  const originalPostgresPassword = process.env.POSTGRES_PASSWORD;
  const originalPostgresDatabase = process.env.POSTGRES_DATABASE;

  delete process.env.DATABASE_URL;
  delete process.env.SUPABASE_DB_URL;
  delete process.env.POSTGRES_URL;
  process.env.POSTGRES_USER = 'postgres';
  process.env.POSTGRES_HOST = 'db.example.supabase.co';
  process.env.POSTGRES_PASSWORD = 'secret';
  process.env.POSTGRES_DATABASE = 'postgres';

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

    if (originalPostgresUrl === undefined) {
      delete process.env.POSTGRES_URL;
    } else {
      process.env.POSTGRES_URL = originalPostgresUrl;
    }

    if (originalPostgresUser === undefined) {
      delete process.env.POSTGRES_USER;
    } else {
      process.env.POSTGRES_USER = originalPostgresUser;
    }

    if (originalPostgresHost === undefined) {
      delete process.env.POSTGRES_HOST;
    } else {
      process.env.POSTGRES_HOST = originalPostgresHost;
    }

    if (originalPostgresPassword === undefined) {
      delete process.env.POSTGRES_PASSWORD;
    } else {
      process.env.POSTGRES_PASSWORD = originalPostgresPassword;
    }

    if (originalPostgresDatabase === undefined) {
      delete process.env.POSTGRES_DATABASE;
    } else {
      process.env.POSTGRES_DATABASE = originalPostgresDatabase;
    }
  }
});
