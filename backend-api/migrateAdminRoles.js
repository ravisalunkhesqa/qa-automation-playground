const { query } = require('./db');

(async () => {
  try {
    const result = await query(
      "UPDATE auth.users SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', to_jsonb('admin'::text)), \"role\" = 'authenticated' WHERE \"role\" ILIKE 'admin' RETURNING id, email, \"role\", is_super_admin, raw_user_meta_data"
    );
    console.log('MIGRATED_ROWS:', JSON.stringify(result.rows, null, 2));
    console.log('MIGRATED_COUNT:', result.rowCount);
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  }
})();
