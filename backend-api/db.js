const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

function getConnectionString() {
  const connectionString = process.env.SUPABASE_DB_URL
    || process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.DATABASE_URL;

  if (connectionString) {
    return connectionString;
  }

  const host = process.env.POSTGRES_HOST || process.env.PGHOST;
  const user = process.env.POSTGRES_USER || process.env.PGUSER;
  const password = process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD;
  const database = process.env.POSTGRES_DATABASE || process.env.PGDATABASE;
  const port = process.env.POSTGRES_PORT || 5432;

  if (host && user && password && database) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  return '';
}

function getDbConfig() {
  // Enforce using the Supabase-provided Postgres URL for all DB operations in this playground.
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error('SUPABASE_DB_URL, POSTGRES_URL, POSTGRES_* or DATABASE_URL must be set. Local DB usage is disabled for the SQL playground.');
  }

  const parsed = new URL(connectionString);

  // Defensive measure: strip any ?family=4 (or similar) query params from the
  // connection string. These params aren't understood by the pg Pool
  // constructor, so we rely solely on the explicit config object below to
  // force IPv4 resolution.
  if (parsed.searchParams.has('family')) {
    parsed.searchParams.delete('family');
  }

  const cfg = {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    database: parsed.pathname.replace(/^\//, ''),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    family: 4,
    ssl: { rejectUnauthorized: false }
  };

  // Prevent accidental usage of localhost or 127.0.0.1 to avoid local DB access.
  if (cfg.host === 'localhost' || cfg.host === '127.0.0.1') {
    throw new Error('Local database URLs are not allowed. Set SUPABASE_DB_URL to your Supabase Postgres connection string.');
  }

  return cfg;
}

const pool = new Pool(getDbConfig());

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error", err);
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function testConnection() {
  const result = await pool.query("SELECT NOW() AS now");
  return result.rows[0];
}

async function initializeDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL
      )
    `);

    const existing = await query("SELECT COUNT(*)::int AS count FROM users");
    if (existing.rows[0].count === 0) {
      await query("INSERT INTO users (first_name, last_name) VALUES ($1, $2)", ["John", "Smith"]);
    }

    const schemaPath = path.join(__dirname, "HRMS_SCHEMA.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    const statements = schemaSql
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await query(statement);
    }
  } catch (error) {
    console.warn("Database initialization skipped:", error.message);
  }
}

module.exports = {
  getDbConfig,
  pool,
  query,
  testConnection,
  initializeDatabase
};
