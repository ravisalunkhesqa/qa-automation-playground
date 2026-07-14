const test = require('node:test');
const assert = require('node:assert/strict');

const { listUsers, createUser, updateUser, deleteUser } = require('../routes/users.controller');

test('listUsers maps database rows to API users', async () => {
  const fakeQuery = async () => ({
    rows: [{ id: 1, first_name: 'John', last_name: 'Smith' }]
  });

  const users = await listUsers(fakeQuery);

  assert.deepEqual(users, [{ id: 1, firstName: 'John', lastName: 'Smith' }]);
});

test('createUser inserts a new user and returns its API shape', async () => {
  const fakeQuery = async (text, params) => {
    assert.equal(text.includes('INSERT INTO users'), true);
    assert.deepEqual(params, ['Jane', 'Doe']);
    return { rows: [{ id: 2, first_name: 'Jane', last_name: 'Doe' }] };
  };

  const user = await createUser({ firstName: 'Jane', lastName: 'Doe' }, fakeQuery);

  assert.deepEqual(user, { id: 2, firstName: 'Jane', lastName: 'Doe' });
});

test('updateUser updates an existing user', async () => {
  const fakeQuery = async () => ({ rows: [{ id: 3, first_name: 'Updated', last_name: 'User' }] });

  const user = await updateUser(3, { firstName: 'Updated', lastName: 'User' }, fakeQuery);

  assert.deepEqual(user, { id: 3, firstName: 'Updated', lastName: 'User' });
});

test('deleteUser removes the requested row', async () => {
  const fakeQuery = async () => ({ rowCount: 1 });

  const deleted = await deleteUser(4, fakeQuery);

  assert.equal(deleted, true);
});
