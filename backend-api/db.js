const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

function getDbConfig() {
  // Enforce using the Supabase-provided Postgres URL for all DB operations in this playground.
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('SUPABASE_DB_URL or DATABASE_URL must be set. Local DB usage is disabled for the SQL playground.');
  }

  const parsed = new URL(connectionString);
  const cfg = {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    database: parsed.pathname.replace(/^\//, ''),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    ssl: { rejectUnauthorized: false },
    family: 4
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
