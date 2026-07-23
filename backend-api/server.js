const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { supabase, supabaseHealth } = require("./supabase");
const { initializeDatabase, testConnection } = require("./db");

const app = express();
const hrmsRoutes = require("./routes/hrms");
const adminRoutes = require("./routes/admin");
const usersRoutes = require("./routes/users");

initializeDatabase().catch((error) => {
  console.warn("Database initialization failed:", error.message);
});

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRoutes);
app.use("/api", hrmsRoutes);
app.use("/api/hrms", hrmsRoutes);
app.use('/api/admin', adminRoutes);

// DEV-only SQL playground endpoint. Enabled when NODE_ENV !== 'production' or when
// ENABLE_SQL_PLAYGROUND=true is set. This endpoint deliberately restricts queries
// to read-only SELECT statements to avoid accidental data changes on shared DBs.
app.post('/api/sql/run', async (req, res) => {
  const enabled = process.env.ENABLE_SQL_PLAYGROUND === 'true' || process.env.NODE_ENV !== 'production';
  if (!enabled) {
    return res.status(403).json({ message: 'SQL playground disabled in this environment' });
  }

  const sql = (req.body?.query || '').toString();
  if (!sql) return res.status(400).json({ message: 'Missing `query` in request body' });

  // Simple safety: only allow SELECT queries (and common read-only constructs).
  const forbidden = /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|replace|copy)\b/i;
  if (forbidden.test(sql)) {
    return res.status(400).json({ message: 'Only read-only SELECT queries are allowed via this endpoint' });
  }

  // Use Supabase Postgres connection (must be provided via POSTGRES_URL / POSTGRES_URL_NON_POOLING / SUPABASE_DB_URL / DATABASE_URL).
  const supabaseDbUrl = process.env.SUPABASE_DB_URL
    || process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.DATABASE_URL
    || '';

  if (!supabaseDbUrl || (!/supabase/i.test(supabaseDbUrl) && !/postgres/i.test(supabaseDbUrl))) {
    return res.status(400).json({ message: 'SQL playground requires a valid Postgres connection string from Supabase (POSTGRES_URL / POSTGRES_URL_NON_POOLING / SUPABASE_DB_URL / DATABASE_URL).' });
  }

  try {
    const { query: dbQuery, getDbConfig } = require('./db');
    const cfg = getDbConfig();
    // guard against accidentally pointing to a localhost/local Postgres instance
    if (cfg.host && (cfg.host === 'localhost' || cfg.host === '127.0.0.1')) {
      return res.status(400).json({ message: 'Local databases are not allowed for the SQL playground. Set SUPABASE_DB_URL to use the Supabase Postgres instance.' });
    }

    const result = await dbQuery(sql);
    return res.json({ rowCount: result.rowCount, rows: result.rows });
  } catch (error) {
    console.error('SQL playground error:', error.message || error);
    const isNetworkIssue = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|timeout|connect/i.test(error.message || String(error));
    return res.status(503).json({
      message: isNetworkIssue
        ? 'The SQL playground could not reach the configured direct Postgres host in this deployment. Use the Supabase SDK-backed API routes for application data.'
        : 'Query execution failed',
      error: error.message || String(error)
    });
  }
});

// Root: provide a simple redirect to the health endpoint so the service
// responds at `/` instead of showing "Cannot GET /" from Express.
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await supabaseHealth();
    const supabaseReady = typeof result?.count === 'number';
    const databaseStatus = await testConnection().then((dbResult) => ({
      connected: true,
      now: dbResult?.now || null
    })).catch((error) => ({
      connected: false,
      error: error.message
    }));

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null;
    const supabaseKeyConfigured = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY
      || process.env.SUPABASE_SECRET_KEY
      || process.env.SUPABASE_ANON_KEY
      || process.env.SUPABASE_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    res.json({
      status: supabaseReady ? "SUCCESS" : "ERROR",
      message: supabaseReady ? "QA Automation Playground API Running" : "Supabase connection failed",
      database: {
        configured: Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || process.env.POSTGRES_HOST),
        connected: databaseStatus.connected,
        error: databaseStatus.connected ? null : databaseStatus.error || null,
        now: databaseStatus.now || null,
        mode: databaseStatus.connected ? 'postgres-pool' : 'supabase-sdk'
      },
      supabase: {
        url: supabaseUrl,
        publishableKeyConfigured: supabaseKeyConfigured,
        sdkHealthy: supabaseReady,
        tableAccess: result
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Supabase connection failed",
      error: error.message,
      database: {
        configured: Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || process.env.POSTGRES_HOST),
        connected: false,
        error: error.message
      },
      supabase: {
        url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        publishableKeyConfigured: Boolean(
          process.env.SUPABASE_SERVICE_ROLE_KEY
          || process.env.SUPABASE_SECRET_KEY
          || process.env.SUPABASE_ANON_KEY
          || process.env.SUPABASE_PUBLISHABLE_KEY
          || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        )
      }
    });
  }
});

app.listen(5000, () => {
  console.log("Server Started On Port 5000");
});
