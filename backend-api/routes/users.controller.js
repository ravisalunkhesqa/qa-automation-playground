function normalizeUser(row) {
  return {
    id: row.id,
    firstName: row.firstName ?? row.first_name,
    lastName: row.lastName ?? row.last_name
  };
}

async function listUsers(queryFn) {
  const result = await queryFn(
    'SELECT id, first_name AS "firstName", last_name AS "lastName" FROM users ORDER BY id'
  );

  return result.rows.map(normalizeUser);
}

async function createUser(payload, queryFn) {
  const result = await queryFn(
    'INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING id, first_name AS "firstName", last_name AS "lastName"',
    [payload.firstName, payload.lastName]
  );

  return normalizeUser(result.rows[0]);
}

async function updateUser(id, payload, queryFn) {
  const result = await queryFn(
    'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING id, first_name AS "firstName", last_name AS "lastName"',
    [payload.firstName, payload.lastName, id]
  );

  return normalizeUser(result.rows[0]);
}

async function deleteUser(id, queryFn) {
  const result = await queryFn('DELETE FROM users WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser
};
