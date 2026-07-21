const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { supabase } = require('../supabase');

dotenv.config();

// Dev-only admin route: lists auth users from Supabase
// Protected by admin role checks and optional ADMIN_EMAILS configuration.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || '').split(',').map((email) => String(email).trim().toLowerCase()).filter(Boolean);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function getRoleLabel(user) {
  if (!user) return 'end user';
  if (user.is_super_admin) return 'super admin';
  const appRole = String(user?.raw_user_meta_data?.role || user?.role || '').trim().toLowerCase();
  if (appRole === 'admin') return 'admin';
  return 'end user';
}

function isAdminUser(user) {
  if (!user) return false;
  if (user.is_super_admin) return true;
  return String(user?.raw_user_meta_data?.role || user?.role || '').trim().toLowerCase() === 'admin';
}

async function getAuthUserByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const { query } = require('../db');
  const result = await query(
    'SELECT id, email, "role", is_super_admin, raw_app_meta_data, raw_user_meta_data, created_at FROM auth.users WHERE email ILIKE $1 LIMIT 1',
    [normalized]
  );
  return result.rows[0] || null;
}

async function getAuthUserById(id) {
  const normalizedId = String(id || '').trim();
  if (!normalizedId) return null;

  const { query } = require('../db');
  const result = await query(
    'SELECT id, email, "role", is_super_admin, raw_app_meta_data, raw_user_meta_data, created_at FROM auth.users WHERE id = $1 LIMIT 1',
    [normalizedId]
  );
  return result.rows[0] || null;
}

router.get('/auth-users/me', async (req, res) => {
  const caller = normalizeEmail(req.headers['x-admin-email']);
  if (!caller) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const callerUser = await getAuthUserByEmail(caller);
  if (!callerUser) {
    return res.status(403).json({ message: 'Caller email not registered in auth users' });
  }

  const role = getRoleLabel(callerUser);
  const allowed = ADMIN_EMAILS.includes(caller) || isAdminUser(callerUser);
  if (!allowed) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json({ email: callerUser.email, role, is_super_admin: Boolean(callerUser.is_super_admin), allowed });
});

router.get('/auth-users', async (req, res) => {
  const caller = normalizeEmail(req.headers['x-admin-email']);
  if (!caller) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const callerUser = await getAuthUserByEmail(caller);
  if (!callerUser) {
    return res.status(403).json({ message: 'Caller email not registered in auth users' });
  }

  const allowed = ADMIN_EMAILS.includes(caller) || isAdminUser(callerUser);
  if (!allowed) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!supabase) return res.status(500).json({ message: 'Supabase client not configured' });

  try {
    // Use the admin RLS-free endpoint from Supabase: request via auth.admin API is not available
    // in client libs; we can query the `auth.users` table via the Postgres connection if needed.
    // Here we use the REST-like admin endpoint via the Supabase client from /rpc or via direct SQL.

    // For simplicity and to avoid exposing the service role key, use the Supabase client to call
    // the Postgres `auth.users` via `from('users')` is not allowed. Instead, we'll call a safe
    // Postgres function to list users if available. As a pragmatic approach for development only,
    // we'll fetch the `playground_items` and return a message indicating admin should use Supabase
    // dashboard when auth listing isn't available.

    // Attempt to fetch via Postgres using server-side db connection if available.
    const { query } = require('../db');
    try {
      const rows = await query("SELECT id, email, \"role\", raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at FROM auth.users ORDER BY id DESC LIMIT 500");
      return res.json({
        caller: {
          email: callerUser.email,
          role: getRoleLabel(callerUser),
          is_super_admin: Boolean(callerUser.is_super_admin)
        },
        rows: rows.rows
      });
    } catch (pgErr) {
      // fallback: indicate inability to query auth.users from this environment
      return res.status(500).json({ message: 'Failed to query auth.users from Postgres', error: pgErr.message });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Internal error', error: err.message });
  }
});

router.post('/auth-users/super-admin', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ message: 'Missing email in request body' });
  }

  const caller = normalizeEmail(req.headers['x-admin-email']);
  if (!caller) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const callerUser = await getAuthUserByEmail(caller);
  if (!callerUser) {
    return res.status(403).json({ message: 'Caller email not registered in auth users' });
  }

  if (!callerUser.is_super_admin) {
    return res.status(403).json({ message: 'Only super admins can promote users' });
  }

  try {
    const { query } = require('../db');
    const result = await query(
      'UPDATE auth.users SET "role" = $1, is_super_admin = true WHERE email ILIKE $2 RETURNING id, email, "role", is_super_admin, raw_user_meta_data, created_at',
      ['authenticated', email]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ rows: result.rows, rowCount: result.rowCount });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to set super admin', error: err.message });
  }
});

router.post('/auth-users/role', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const requestedRole = String(req.body?.role || '').trim().toLowerCase();
  const normalizedRole = requestedRole === 'super admin' || requestedRole === 'super_admin' || requestedRole === 'superadmin'
    ? 'super admin'
    : requestedRole === 'admin'
      ? 'admin'
      : 'end user';

  if (!email) {
    return res.status(400).json({ message: 'Missing email in request body' });
  }

  if (!['super admin', 'admin', 'end user'].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Role must be "super admin", "admin", or "end user"' });
  }

  const caller = normalizeEmail(req.headers['x-admin-email']);
  if (!caller) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const callerUser = await getAuthUserByEmail(caller);
  if (!callerUser) {
    return res.status(403).json({ message: 'Caller email not registered in auth users' });
  }

  if (!callerUser.is_super_admin) {
    return res.status(403).json({ message: 'Only super admins can assign roles' });
  }

  const targetUser = await getAuthUserByEmail(email);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isSuperAdminTarget = normalizedRole === 'super admin';
  const roleValue = isSuperAdminTarget ? 'admin' : normalizedRole;
  const isSuperAdminValue = isSuperAdminTarget;

  if (!isSuperAdminTarget && targetUser.is_super_admin) {
    const { query } = require('../db');
    const result = await query('SELECT COUNT(*)::int AS count FROM auth.users WHERE is_super_admin = true');
    if (result.rows[0].count <= 1) {
      return res.status(400).json({ message: 'Application must have at least one super admin' });
    }
  }

  try {
    const { query } = require('../db');
    const result = await query(
      "UPDATE auth.users SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', to_jsonb($1::text)), is_super_admin = $2, \"role\" = $3 WHERE email ILIKE $4 RETURNING id, email, \"role\", is_super_admin, raw_user_meta_data, created_at",
      [roleValue, isSuperAdminValue, 'authenticated', email]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ rows: result.rows, rowCount: result.rowCount });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to assign role', error: err.message });
  }
});

router.post('/auth-users/migrate-roles', async (req, res) => {
  const caller = normalizeEmail(req.headers['x-admin-email']);
  if (!caller) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const callerUser = await getAuthUserByEmail(caller);
  if (!callerUser) {
    return res.status(403).json({ message: 'Caller email not registered in auth users' });
  }

  if (!callerUser.is_super_admin) {
    return res.status(403).json({ message: 'Only super admins can migrate roles' });
  }

  try {
    const { query } = require('../db');
    const result = await query(
      "UPDATE auth.users SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', to_jsonb('admin'::text)), \"role\" = 'authenticated' WHERE \"role\" ILIKE 'admin' RETURNING id, email, \"role\", is_super_admin, raw_user_meta_data, created_at"
    );
    return res.json({ migrated: result.rowCount, rows: result.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to migrate admin roles', error: err.message });
  }
});

router.delete('/auth-users/:id', async (req, res) => {
  const caller = normalizeEmail(req.headers['x-admin-email']);
  if (!caller) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const callerUser = await getAuthUserByEmail(caller);
  if (!callerUser) {
    return res.status(403).json({ message: 'Caller email not registered in auth users' });
  }

  if (!isAdminUser(callerUser)) {
    return res.status(403).json({ message: 'Only admins and super admins can delete users' });
  }

  const target = await getAuthUserById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (target.is_super_admin) {
    return res.status(403).json({ message: 'Super admins cannot delete other super admins' });
  }

  const targetRole = getRoleLabel(target);
  if (!callerUser.is_super_admin && targetRole !== 'end user') {
    return res.status(403).json({ message: 'Admins can only delete end users' });
  }

  try {
    const { query } = require('../db');
    await query('DELETE FROM auth.users WHERE id = $1', [target.id]);
    return res.json({ message: 'User deleted', deletedId: target.id });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

module.exports = router;
