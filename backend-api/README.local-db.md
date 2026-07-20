# Supabase database setup

Use this when the employee CRUD endpoints should persist to the existing Supabase project.

## Required values
Set these values in `backend-api/.env`:
- `DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres`
- `DB_HOST=db.<project-ref>.supabase.co`
- `DB_PORT=5432`
- `DB_NAME=postgres`
- `DB_USER=postgres`
- `DB_PASSWORD=<password>`

The backend now accepts both `DATABASE_URL` and the legacy `DB_*` variables for the Supabase connection path.
