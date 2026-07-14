const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

function getDbConfig() {
  const sslEnabled = Boolean(process.env.DB_HOST && process.env.DB_HOST.includes("supabase"));

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
  };
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
