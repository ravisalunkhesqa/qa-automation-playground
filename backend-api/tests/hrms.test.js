const test = require('node:test');
const assert = require('node:assert/strict');

const { applyEmployeeFilters, paginateResults, validateEmployeePayload } = require('../routes/hrms');

test('filters employees by department, status and active flag', () => {
  const employees = [
    { employeeId: 1, department: { departmentName: 'QA' }, employmentStatus: 'Permanent', isActive: true },
    { employeeId: 2, department: { departmentName: 'Engineering' }, employmentStatus: 'Contract', isActive: false },
    { employeeId: 3, department: { departmentName: 'QA' }, employmentStatus: 'Permanent', isActive: false }
  ];

  const result = applyEmployeeFilters(employees, { department: 'QA', status: 'Permanent', isActive: 'true' });
  assert.deepEqual(result.map(item => item.employeeId), [1]);
});

test('paginates results based on page and limit', () => {
  const employees = [{ employeeId: 1 }, { employeeId: 2 }, { employeeId: 3 }, { employeeId: 4 }];
  const result = paginateResults(employees, { page: 2, limit: 2 });

  assert.equal(result.items.length, 2);
  assert.deepEqual(result.items.map(item => item.employeeId), [3, 4]);
  assert.equal(result.pagination.page, 2);
  assert.equal(result.pagination.totalItems, 4);
});

test('validates required employee fields', () => {
  const errors = validateEmployeePayload({ employeeCode: 'EMP001', firstName: 'Leanne' });
  assert.ok(errors.includes('lastName is required'));
  assert.ok(errors.includes('username is required'));
  assert.ok(errors.includes('email is required'));
});
