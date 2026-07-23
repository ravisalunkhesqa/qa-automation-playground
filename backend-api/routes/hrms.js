const express = require('express');
const { query } = require('../db');
const { supabase } = require('../supabase');

const router = express.Router();

const fallbackDepartments = [
  { departmentId: 1, departmentName: 'Engineering', departmentCode: 'ENG' },
  { departmentId: 2, departmentName: 'QA', departmentCode: 'QA' },
  { departmentId: 3, departmentName: 'HR', departmentCode: 'HR' },
  { departmentId: 4, departmentName: 'Finance', departmentCode: 'FIN' },
];

const fallbackJobTitles = [
  { jobTitleId: 1, jobTitleName: 'Test Engineer', description: 'Entry-level QA role' },
  { jobTitleId: 2, jobTitleName: 'Senior Test Engineer', description: 'Experienced QA professional' },
  { jobTitleId: 3, jobTitleName: 'Automation Architect', description: 'Automation strategy and framework design' },
  { jobTitleId: 4, jobTitleName: 'Software Developer', description: 'Application development' },
  { jobTitleId: 5, jobTitleName: 'HR Executive', description: 'People operations role' },
];

let fallbackEmployees = [
  {
    employeeId: 1,
    employeeCode: 'EMP001',
    firstName: 'Leanne',
    lastName: 'Graham',
    username: 'Bret',
    email: 'sincere@april.biz',
    gender: 'Female',
    phone: '1-770-736-8031 x56442',
    dateOfBirth: '1990-09-15',
    dateOfJoining: '2024-01-10',
    employmentStatus: 'Permanent',
    salary: 85000,
    department: { departmentId: 1, departmentName: 'Engineering' },
    jobTitle: { jobTitleId: 2, jobTitleName: 'Senior Test Engineer' },
    supervisor: { employeeId: 5, firstName: 'John', lastName: 'Smith' },
    isActive: true,
    isManager: false,
    isRemoteWorker: true,
    address: { addressLine1: 'Kulas Light', addressLine2: 'Apt. 556', city: 'Gwenborough', state: 'California', country: 'USA', zipcode: '92998-3874' },
    createdAt: '2026-07-16T10:00:00Z',
  },
  {
    employeeId: 2,
    employeeCode: 'EMP002',
    firstName: 'Ervin',
    lastName: 'Howell',
    username: 'Antonette',
    email: 'shanna@melissa.tv',
    gender: 'Male',
    phone: '010-692-6593 x09125',
    dateOfBirth: '1988-05-20',
    dateOfJoining: '2023-06-15',
    employmentStatus: 'Contract',
    salary: 62000,
    department: { departmentId: 2, departmentName: 'QA' },
    jobTitle: { jobTitleId: 1, jobTitleName: 'Test Engineer' },
    supervisor: { employeeId: 1, firstName: 'Leanne', lastName: 'Graham' },
    isActive: true,
    isManager: false,
    isRemoteWorker: false,
    address: null,
    createdAt: '2026-07-16T10:15:00Z',
  },
];

const buildEmployeeResponse = (employee) => {
  if (!employee) {
    return null;
  }

  const department = employee.department || null;
  const jobTitle = employee.jobTitle || null;
  const supervisor = employee.supervisor || null;
  const address = employee.address || null;
  const departmentId = employee.department_id ?? department?.departmentId ?? department?.department_id ?? null;
  const departmentName = employee.department_name ?? department?.departmentName ?? department?.department_name ?? null;
  const jobTitleId = employee.job_title_id ?? jobTitle?.jobTitleId ?? jobTitle?.job_title_id ?? null;
  const jobTitleName = employee.job_title_name ?? jobTitle?.jobTitleName ?? jobTitle?.job_title_name ?? null;
  const supervisorId = employee.supervisor_id ?? supervisor?.employeeId ?? supervisor?.employee_id ?? null;
  const supervisorName = `${supervisor?.firstName || supervisor?.first_name || ''} ${supervisor?.lastName || supervisor?.last_name || ''}`.trim();

  return {
    employeeId: employee.employee_id ?? employee.employeeId,
    employeeCode: employee.employee_code ?? employee.employeeCode,
    firstName: employee.first_name ?? employee.firstName,
    lastName: employee.last_name ?? employee.lastName,
    username: employee.username,
    email: employee.email,
    gender: employee.gender,
    phone: employee.phone,
    dateOfBirth: employee.date_of_birth ?? employee.dateOfBirth,
    dateOfJoining: employee.date_of_joining ?? employee.dateOfJoining,
    employmentStatus: employee.employment_status ?? employee.employmentStatus,
    salary: employee.salary,
    department: departmentId != null ? { departmentId, departmentName } : null,
    jobTitle: jobTitleId != null ? { jobTitleId, jobTitleName } : null,
    supervisor: supervisorId ? { employeeId: supervisorId, employeeName: supervisorName } : null,
    isActive: employee.is_active ?? employee.isActive,
    isManager: employee.is_manager ?? employee.isManager,
    isRemoteWorker: employee.is_remote_worker ?? employee.isRemoteWorker,
    address: address ? {
      addressLine1: address.addressLine1 ?? address.address_line1 ?? null,
      addressLine2: address.addressLine2 ?? address.address_line2 ?? null,
      city: address.city,
      state: address.state,
      country: address.country,
      zipcode: address.zipcode,
    } : null,
    createdAt: employee.created_at ?? employee.createdAt,
  };
};

const applyEmployeeFilters = (employees, filters = {}) => {
  const name = (filters.name || '').toString().trim().toLowerCase();
  const department = (filters.department || '').toString().trim().toLowerCase();
  const status = (filters.status || '').toString().trim().toLowerCase();
  const isActive = (filters.isActive || '').toString().trim().toLowerCase();

  return employees.filter((employee) => {
    const firstName = (employee.firstName || employee.first_name || '').toString().toLowerCase();
    const lastName = (employee.lastName || employee.last_name || '').toString().toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const reversedFullName = `${lastName} ${firstName}`.trim();

    const matchesName = !name || fullName.includes(name) || reversedFullName.includes(name);
    const matchesDepartment = !department || (employee.department?.departmentName || employee.department?.department_name || '').toString().toLowerCase().includes(department);
    const matchesStatus = !status || (employee.employmentStatus || employee.employment_status || '').toString().toLowerCase().includes(status);
    const matchesActive = isActive === '' || String(employee.isActive ?? employee.is_active) === isActive;

    return matchesName && matchesDepartment && matchesStatus && matchesActive;
  });
};

const paginateResults = (employees, options = {}) => {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = employees.slice(start, end);

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems: employees.length,
      totalPages: Math.max(1, Math.ceil(employees.length / limit)),
    },
  };
};

const validateEmployeePayload = (payload = {}) => {
  const errors = [];

  if (!payload.firstName) errors.push('firstName is required');
  if (!payload.lastName) errors.push('lastName is required');
  if (!payload.username) errors.push('username is required');
  if (!payload.email) errors.push('email is required');
  if (!payload.departmentId) errors.push('departmentId is required');
  if (!payload.jobTitleId) errors.push('jobTitleId is required');

  return errors;
};

const isDbUnavailable = (error) => Boolean(error && /ENOTFOUND|ECONNREFUSED|timeout|connect/i.test(error.message || ''));

const normalizeSupabaseEmployee = (row = {}) => {
  const address = Array.isArray(row.employee_addresses) ? row.employee_addresses[0] : null;
  const department = row.department || null;
  const jobTitle = row.job_title || null;
  const supervisor = row.supervisor || null;

  return {
    employeeId: row.employee_id ?? row.employeeId,
    employeeCode: row.employee_code ?? row.employeeCode,
    firstName: row.first_name ?? row.firstName,
    lastName: row.last_name ?? row.lastName,
    username: row.username,
    email: row.email,
    gender: row.gender,
    phone: row.phone,
    dateOfBirth: row.date_of_birth ?? row.dateOfBirth,
    dateOfJoining: row.date_of_joining ?? row.dateOfJoining,
    employmentStatus: row.employment_status ?? row.employmentStatus,
    salary: row.salary,
    department: department ? {
      departmentId: department.department_id ?? department.departmentId,
      departmentName: department.department_name ?? department.departmentName,
    } : null,
    jobTitle: jobTitle ? {
      jobTitleId: jobTitle.job_title_id ?? jobTitle.jobTitleId,
      jobTitleName: jobTitle.job_title_name ?? jobTitle.jobTitleName,
    } : null,
    supervisor: supervisor ? {
      employeeId: supervisor.employee_id ?? supervisor.employeeId,
      firstName: supervisor.first_name ?? supervisor.firstName,
      lastName: supervisor.last_name ?? supervisor.lastName,
    } : null,
    isActive: row.is_active ?? row.isActive,
    isManager: row.is_manager ?? row.isManager,
    isRemoteWorker: row.is_remote_worker ?? row.isRemoteWorker,
    address: address ? {
      addressLine1: address.address_line1 ?? address.addressLine1,
      addressLine2: address.address_line2 ?? address.addressLine2,
      city: address.city,
      state: address.state,
      country: address.country,
      zipcode: address.zipcode,
    } : null,
    createdAt: row.created_at ?? row.createdAt,
  };
};

const generateEmployeeCode = (employees = fallbackEmployees) => {
  const numericCodes = employees
    .map((employee) => Number(String(employee.employeeCode || employee.employee_code || '').replace(/\D/g, '')))
    .filter((value) => Number.isFinite(value));

  const nextNumber = numericCodes.length > 0 ? Math.max(...numericCodes) + 1 : 1;
  return `EMP${String(nextNumber).padStart(3, '0')}`;
};

const getNextEmployeeCode = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('employees').select('employee_code');
    if (!error && data) {
      return generateEmployeeCode(data.map((row) => ({ employeeCode: row.employee_code })));
    }
  }

  try {
    const result = await query("SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(employee_code, '\\D', '', 'g') AS INTEGER)), 0) + 1 AS next_number FROM employees");
    const nextNumber = Number(result.rows[0]?.next_number || 1);
    return `EMP${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    if (isDbUnavailable(error)) {
      return generateEmployeeCode();
    }
    throw error;
  }
};

const fetchEmployeesFromDb = async () => {
  if (supabase) {
    const [employeesResult, departmentsResult, jobTitlesResult, supervisorsResult, addressesResult] = await Promise.all([
      supabase.from('employees').select(`
        employee_id,
        employee_code,
        first_name,
        last_name,
        username,
        email,
        gender,
        phone,
        date_of_birth,
        date_of_joining,
        employment_status,
        salary,
        department_id,
        job_title_id,
        supervisor_id,
        is_active,
        is_manager,
        is_remote_worker,
        created_at
      `).order('employee_id', { ascending: true }),
      supabase.from('departments').select('department_id, department_name, department_code'),
      supabase.from('job_titles').select('job_title_id, job_title_name, description'),
      supabase.from('employees').select('employee_id, first_name, last_name'),
      supabase.from('employee_addresses').select('*')
    ]);

    const employeesError = employeesResult.error;
    if (!employeesError && employeesResult.data) {
      const departments = departmentsResult.data || [];
      const jobTitles = jobTitlesResult.data || [];
      const supervisors = supervisorsResult.data || [];
      const addresses = addressesResult.data || [];

      const departmentLookup = new Map(departments.map((item) => [item.department_id, item]));
      const jobTitleLookup = new Map(jobTitles.map((item) => [item.job_title_id, item]));
      const supervisorLookup = new Map(supervisors.map((item) => [item.employee_id, item]));
      const addressLookup = new Map();

      addresses.forEach((address) => {
        const id = address.employee_id;
        if (!addressLookup.has(id)) {
          addressLookup.set(id, []);
        }
        addressLookup.get(id).push(address);
      });

      return employeesResult.data.map((row) => normalizeSupabaseEmployee({
        ...row,
        department: departmentLookup.get(row.department_id) || null,
        job_title: jobTitleLookup.get(row.job_title_id) || null,
        supervisor: supervisorLookup.get(row.supervisor_id) || null,
        employee_addresses: addressLookup.get(row.employee_id) || []
      }));
    }
  }

  try {
    const result = await query(`
      SELECT
        e.employee_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.username,
        e.email,
        e.gender,
        e.phone,
        e.date_of_birth,
        e.date_of_joining,
        e.employment_status,
        e.salary,
        e.department_id,
        d.department_name,
        e.job_title_id,
        jt.job_title_name,
        e.supervisor_id,
        s.first_name AS supervisor_first_name,
        s.last_name AS supervisor_last_name,
        e.is_active,
        e.is_manager,
        e.is_remote_worker,
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.country,
        a.zipcode,
        e.created_at
      FROM employees e
      LEFT JOIN departments d ON d.department_id = e.department_id
      LEFT JOIN job_titles jt ON jt.job_title_id = e.job_title_id
      LEFT JOIN employees s ON s.employee_id = e.supervisor_id
      LEFT JOIN employee_addresses a ON a.employee_id = e.employee_id
      ORDER BY e.employee_id ASC
    `);
    return result.rows;
  } catch (error) {
    if (isDbUnavailable(error)) {
      return fallbackEmployees;
    }
    throw error;
  }
};

const fetchEmployeesFromDbWithSource = async () => {
  if (supabase) {
    const [employeesResult, departmentsResult, jobTitlesResult, supervisorsResult, addressesResult] = await Promise.all([
      supabase.from('employees').select(`
        employee_id,
        employee_code,
        first_name,
        last_name,
        username,
        email,
        gender,
        phone,
        date_of_birth,
        date_of_joining,
        employment_status,
        salary,
        department_id,
        job_title_id,
        supervisor_id,
        is_active,
        is_manager,
        is_remote_worker,
        created_at
      `).order('employee_id', { ascending: true }),
      supabase.from('departments').select('department_id, department_name, department_code'),
      supabase.from('job_titles').select('job_title_id, job_title_name, description'),
      supabase.from('employees').select('employee_id, first_name, last_name'),
      supabase.from('employee_addresses').select('*')
    ]);

    if (!employeesResult.error && employeesResult.data) {
      const departments = departmentsResult.data || [];
      const jobTitles = jobTitlesResult.data || [];
      const supervisors = supervisorsResult.data || [];
      const addresses = addressesResult.data || [];

      const departmentLookup = new Map(departments.map((item) => [item.department_id, item]));
      const jobTitleLookup = new Map(jobTitles.map((item) => [item.job_title_id, item]));
      const supervisorLookup = new Map(supervisors.map((item) => [item.employee_id, item]));
      const addressLookup = new Map();

      addresses.forEach((address) => {
        const id = address.employee_id;
        if (!addressLookup.has(id)) {
          addressLookup.set(id, []);
        }
        addressLookup.get(id).push(address);
      });

      return {
        employees: employeesResult.data.map((row) => normalizeSupabaseEmployee({
          ...row,
          department: departmentLookup.get(row.department_id) || null,
          job_title: jobTitleLookup.get(row.job_title_id) || null,
          supervisor: supervisorLookup.get(row.supervisor_id) || null,
          employee_addresses: addressLookup.get(row.employee_id) || []
        })),
        source: 'supabase-sdk'
      };
    }
  }

  try {
    const result = await query(`
      SELECT
        e.employee_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.username,
        e.email,
        e.gender,
        e.phone,
        e.date_of_birth,
        e.date_of_joining,
        e.employment_status,
        e.salary,
        e.department_id,
        d.department_name,
        e.job_title_id,
        jt.job_title_name,
        e.supervisor_id,
        s.first_name AS supervisor_first_name,
        s.last_name AS supervisor_last_name,
        e.is_active,
        e.is_manager,
        e.is_remote_worker,
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.country,
        a.zipcode,
        e.created_at
      FROM employees e
      LEFT JOIN departments d ON d.department_id = e.department_id
      LEFT JOIN job_titles jt ON jt.job_title_id = e.job_title_id
      LEFT JOIN employees s ON s.employee_id = e.supervisor_id
      LEFT JOIN employee_addresses a ON a.employee_id = e.employee_id
      ORDER BY e.employee_id ASC
    `);
    return { employees: result.rows, source: 'database' };
  } catch (error) {
    if (isDbUnavailable(error)) {
      return { employees: fallbackEmployees, source: 'fallback' };
    }
    throw error;
  }
};

const fetchEmployeeFromDb = async (id) => {
  if (supabase) {
    const [employeeResult, departmentsResult, jobTitlesResult, supervisorsResult, addressesResult] = await Promise.all([
      supabase.from('employees').select(`
        employee_id,
        employee_code,
        first_name,
        last_name,
        username,
        email,
        gender,
        phone,
        date_of_birth,
        date_of_joining,
        employment_status,
        salary,
        department_id,
        job_title_id,
        supervisor_id,
        is_active,
        is_manager,
        is_remote_worker,
        created_at
      `).eq('employee_id', id).maybeSingle(),
      supabase.from('departments').select('department_id, department_name, department_code'),
      supabase.from('job_titles').select('job_title_id, job_title_name, description'),
      supabase.from('employees').select('employee_id, first_name, last_name'),
      supabase.from('employee_addresses').select('*').eq('employee_id', id)
    ]);

    if (!employeeResult.error && employeeResult.data) {
      const departments = departmentsResult.data || [];
      const jobTitles = jobTitlesResult.data || [];
      const supervisors = supervisorsResult.data || [];
      const addresses = addressesResult.data || [];

      const departmentLookup = new Map(departments.map((item) => [item.department_id, item]));
      const jobTitleLookup = new Map(jobTitles.map((item) => [item.job_title_id, item]));
      const supervisorLookup = new Map(supervisors.map((item) => [item.employee_id, item]));

      return normalizeSupabaseEmployee({
        ...employeeResult.data,
        department: departmentLookup.get(employeeResult.data.department_id) || null,
        job_title: jobTitleLookup.get(employeeResult.data.job_title_id) || null,
        supervisor: supervisorLookup.get(employeeResult.data.supervisor_id) || null,
        employee_addresses: addresses
      });
    }
  }

  try {
    const result = await query(`
      SELECT
        e.employee_id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.username,
        e.email,
        e.gender,
        e.phone,
        e.date_of_birth,
        e.date_of_joining,
        e.employment_status,
        e.salary,
        e.department_id,
        d.department_name,
        e.job_title_id,
        jt.job_title_name,
        e.supervisor_id,
        s.first_name AS supervisor_first_name,
        s.last_name AS supervisor_last_name,
        e.is_active,
        e.is_manager,
        e.is_remote_worker,
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.country,
        a.zipcode,
        e.created_at
      FROM employees e
      LEFT JOIN departments d ON d.department_id = e.department_id
      LEFT JOIN job_titles jt ON jt.job_title_id = e.job_title_id
      LEFT JOIN employees s ON s.employee_id = e.supervisor_id
      LEFT JOIN employee_addresses a ON a.employee_id = e.employee_id
      WHERE e.employee_id = $1
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    if (isDbUnavailable(error)) {
      return fallbackEmployees.find((employee) => String(employee.employeeId ?? employee.employee_id) === String(id)) || null;
    }
    throw error;
  }
};

const fetchDepartmentsFromDb = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('departments').select('*').order('department_id', { ascending: true });
    if (!error && data) {
      return data.map((row) => ({
        departmentId: row.department_id,
        departmentName: row.department_name,
        departmentCode: row.department_code,
        description: row.description,
      }));
    }
  }

  try {
    const result = await query(`
      SELECT department_id AS "departmentId", department_name AS "departmentName", department_code AS "departmentCode"
      FROM departments
      ORDER BY department_id
    `);
    return result.rows;
  } catch (error) {
    if (isDbUnavailable(error)) {
      return fallbackDepartments;
    }
    throw error;
  }
};

const fetchJobTitlesFromDb = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('job_titles').select('*').order('job_title_id', { ascending: true });
    if (!error && data) {
      return data.map((row) => ({
        jobTitleId: row.job_title_id,
        jobTitleName: row.job_title_name,
        description: row.description,
      }));
    }
  }

  try {
    const result = await query(`
      SELECT job_title_id AS "jobTitleId", job_title_name AS "jobTitleName", description
      FROM job_titles
      ORDER BY job_title_id
    `);
    return result.rows;
  } catch (error) {
    if (isDbUnavailable(error)) {
      return fallbackJobTitles;
    }
    throw error;
  }
};

const upsertEmployeeAddress = async (employeeId, address) => {
  if (!address || Object.values(address).every((value) => !value)) return;

  try {
    const existing = await query('SELECT address_id FROM employee_addresses WHERE employee_id = $1', [employeeId]);
    if (existing.rows[0]) {
      await query(`
        UPDATE employee_addresses
        SET address_line1 = $2, address_line2 = $3, city = $4, state = $5, country = $6, zipcode = $7
        WHERE employee_id = $1
      `, [employeeId, address.addressLine1 || null, address.addressLine2 || null, address.city || null, address.state || null, address.country || null, address.zipcode || null]);
      return;
    }

    await query(`
      INSERT INTO employee_addresses (employee_id, address_line1, address_line2, city, state, country, zipcode)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [employeeId, address.addressLine1 || null, address.addressLine2 || null, address.city || null, address.state || null, address.country || null, address.zipcode || null]);
  } catch (error) {
    if (!isDbUnavailable(error)) {
      throw error;
    }
  }
};

const createEmployeeFallback = (payload) => {
  const employeeCode = payload.employeeCode || generateEmployeeCode();
  const department = fallbackDepartments.find((item) => item.departmentId === Number(payload.departmentId));
  const jobTitle = fallbackJobTitles.find((item) => item.jobTitleId === Number(payload.jobTitleId));
  const employee = {
    employeeId: fallbackEmployees.length > 0 ? Math.max(...fallbackEmployees.map((item) => Number(item.employeeId || item.employee_id || 0))) + 1 : 1,
    employeeCode,
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    gender: payload.gender,
    phone: payload.phone,
    dateOfBirth: payload.dateOfBirth,
    dateOfJoining: payload.dateOfJoining,
    employmentStatus: payload.employmentStatus || 'Permanent',
    salary: payload.salary,
    department: department ? { departmentId: department.departmentId, departmentName: department.departmentName } : null,
    jobTitle: jobTitle ? { jobTitleId: jobTitle.jobTitleId, jobTitleName: jobTitle.jobTitleName } : null,
    supervisor: payload.supervisorId ? { employeeId: Number(payload.supervisorId), firstName: 'Supervisor', lastName: 'User' } : null,
    isActive: payload.isActive ?? true,
    isManager: payload.isManager ?? false,
    isRemoteWorker: payload.isRemoteWorker ?? false,
    address: payload.address || null,
    createdAt: new Date().toISOString(),
  };

  fallbackEmployees.push(employee);
  return employee;
};

const updateEmployeeFallback = (id, payload) => {
  const employee = fallbackEmployees.find((item) => String(item.employeeId || item.employee_id) === String(id));
  if (!employee) return null;

  if (payload.firstName !== undefined) employee.firstName = payload.firstName;
  if (payload.lastName !== undefined) employee.lastName = payload.lastName;
  if (payload.username !== undefined) employee.username = payload.username;
  if (payload.email !== undefined) employee.email = payload.email;
  if (payload.gender !== undefined) employee.gender = payload.gender;
  if (payload.phone !== undefined) employee.phone = payload.phone;
  if (payload.dateOfBirth !== undefined) employee.dateOfBirth = payload.dateOfBirth;
  if (payload.dateOfJoining !== undefined) employee.dateOfJoining = payload.dateOfJoining;
  if (payload.employmentStatus !== undefined) employee.employmentStatus = payload.employmentStatus;
  if (payload.salary !== undefined) employee.salary = payload.salary;
  if (payload.departmentId !== undefined) {
    const department = fallbackDepartments.find((item) => item.departmentId === Number(payload.departmentId));
    employee.department = department ? { departmentId: department.departmentId, departmentName: department.departmentName } : null;
  }
  if (payload.jobTitleId !== undefined) {
    const jobTitle = fallbackJobTitles.find((item) => item.jobTitleId === Number(payload.jobTitleId));
    employee.jobTitle = jobTitle ? { jobTitleId: jobTitle.jobTitleId, jobTitleName: jobTitle.jobTitleName } : null;
  }
  if (payload.supervisorId !== undefined) {
    employee.supervisor = payload.supervisorId ? { employeeId: Number(payload.supervisorId), firstName: 'Supervisor', lastName: 'User' } : null;
  }
  if (payload.isActive !== undefined) employee.isActive = payload.isActive;
  if (payload.isManager !== undefined) employee.isManager = payload.isManager;
  if (payload.isRemoteWorker !== undefined) employee.isRemoteWorker = payload.isRemoteWorker;
  if (payload.address !== undefined) employee.address = payload.address || null;
  if (payload.employeeCode !== undefined) employee.employeeCode = payload.employeeCode;

  return employee;
};

const deleteEmployeeFallback = (id) => {
  const index = fallbackEmployees.findIndex((item) => String(item.employeeId || item.employee_id) === String(id));
  if (index === -1) return false;
  fallbackEmployees.splice(index, 1);
  return true;
};

router.get('/employees', async (req, res) => {
  try {
    const { employees: rawEmployees, source } = await fetchEmployeesFromDbWithSource();
    const employees = rawEmployees.map(buildEmployeeResponse);
    const filters = {
      name: req.query.name,
      department: req.query.department,
      status: req.query.status,
      isActive: req.query.isActive,
    };

    const filtered = applyEmployeeFilters(employees, filters);
    const paged = paginateResults(filtered, { page: req.query.page, limit: req.query.limit });

    res.json({
      items: paged.items,
      pagination: paged.pagination,
      dataSource: source,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
  }
});

router.get('/employees/search', async (req, res) => {
  try {
    const department = req.query.department || '';
    const employees = (await fetchEmployeesFromDb()).map(buildEmployeeResponse);
    const results = applyEmployeeFilters(employees, { department });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search employees', error: error.message });
  }
});

router.get('/employees/:id', async (req, res) => {
  try {
    const employee = await fetchEmployeeFromDb(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(buildEmployeeResponse(employee));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employee', error: error.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const errors = validateEmployeePayload(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const employeeCode = req.body.employeeCode || await getNextEmployeeCode();
    const departmentId = req.body.departmentId ? Number(req.body.departmentId) : null;
    const jobTitleId = req.body.jobTitleId ? Number(req.body.jobTitleId) : null;
    const supervisorId = req.body.supervisorId ? Number(req.body.supervisorId) : null;

    if (!supabase) {
      return res.status(500).json({ message: 'Employee creation requires the Supabase SDK to be configured' });
    }

    const payload = {
      employee_code: employeeCode,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      gender: req.body.gender || null,
      phone: req.body.phone || null,
      date_of_birth: req.body.dateOfBirth || null,
      date_of_joining: req.body.dateOfJoining || null,
      employment_status: req.body.employmentStatus || 'Permanent',
      supervisor_id: supervisorId,
      department_id: departmentId,
      job_title_id: jobTitleId,
      salary: req.body.salary != null ? Number(req.body.salary) : null,
      is_active: req.body.isActive !== undefined ? req.body.isActive : true,
      is_manager: req.body.isManager !== undefined ? req.body.isManager : false,
      is_remote_worker: req.body.isRemoteWorker !== undefined ? req.body.isRemoteWorker : false,
    };

    const { data, error } = await supabase.from('employees').insert(payload).select('employee_id').single();
    if (error) {
      throw error;
    }

    const employeeId = data.employee_id;
    if (req.body.address) {
      await upsertEmployeeAddress(employeeId, req.body.address);
    }

    const createdEmployee = await fetchEmployeeFromDb(employeeId);

    res.status(201).json({ employeeId, employeeCode, message: 'Employee created successfully', employee: buildEmployeeResponse(createdEmployee) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create employee', error: error.message });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await fetchEmployeeFromDb(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const errors = validateEmployeePayload(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (!supabase) {
      return res.status(500).json({ message: 'Employee update requires the Supabase SDK to be configured' });
    }

    const payload = {
      employee_code: req.body.employeeCode ?? employee.employeeCode,
      first_name: req.body.firstName ?? employee.firstName,
      last_name: req.body.lastName ?? employee.lastName,
      username: req.body.username ?? employee.username,
      email: req.body.email ?? employee.email,
      gender: req.body.gender ?? employee.gender,
      phone: req.body.phone ?? employee.phone,
      date_of_birth: req.body.dateOfBirth ?? employee.dateOfBirth,
      date_of_joining: req.body.dateOfJoining ?? employee.dateOfJoining,
      employment_status: req.body.employmentStatus ?? employee.employmentStatus,
      supervisor_id: req.body.supervisorId !== undefined ? Number(req.body.supervisorId) : employee.supervisor?.employeeId ?? null,
      department_id: req.body.departmentId !== undefined ? Number(req.body.departmentId) : employee.department?.departmentId ?? null,
      job_title_id: req.body.jobTitleId !== undefined ? Number(req.body.jobTitleId) : employee.jobTitle?.jobTitleId ?? null,
      salary: req.body.salary !== undefined ? Number(req.body.salary) : employee.salary,
      is_active: req.body.isActive !== undefined ? req.body.isActive : employee.isActive,
      is_manager: req.body.isManager !== undefined ? req.body.isManager : employee.isManager,
      is_remote_worker: req.body.isRemoteWorker !== undefined ? req.body.isRemoteWorker : employee.isRemoteWorker,
    };

    const { data, error } = await supabase.from('employees').update(payload).eq('employee_id', id).select('employee_id').single();
    if (error) {
      throw error;
    }

    if (req.body.address) {
      await upsertEmployeeAddress(id, req.body.address);
    }

    const updatedEmployee = await fetchEmployeeFromDb(id);
    res.json(buildEmployeeResponse(updatedEmployee));
  } catch (error) {
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
});

router.patch('/employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await fetchEmployeeFromDb(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (!supabase) {
      return res.status(500).json({ message: 'Employee update requires the Supabase SDK to be configured' });
    }

    const payload = {};
    if (req.body.employeeCode !== undefined) payload.employee_code = req.body.employeeCode;
    if (req.body.firstName !== undefined) payload.first_name = req.body.firstName;
    if (req.body.lastName !== undefined) payload.last_name = req.body.lastName;
    if (req.body.username !== undefined) payload.username = req.body.username;
    if (req.body.email !== undefined) payload.email = req.body.email;
    if (req.body.gender !== undefined) payload.gender = req.body.gender;
    if (req.body.phone !== undefined) payload.phone = req.body.phone;
    if (req.body.dateOfBirth !== undefined) payload.date_of_birth = req.body.dateOfBirth || null;
    if (req.body.dateOfJoining !== undefined) payload.date_of_joining = req.body.dateOfJoining || null;
    if (req.body.employmentStatus !== undefined) payload.employment_status = req.body.employmentStatus;
    if (req.body.supervisorId !== undefined) payload.supervisor_id = req.body.supervisorId !== null ? Number(req.body.supervisorId) : null;
    if (req.body.departmentId !== undefined) payload.department_id = req.body.departmentId !== null ? Number(req.body.departmentId) : null;
    if (req.body.jobTitleId !== undefined) payload.job_title_id = req.body.jobTitleId !== null ? Number(req.body.jobTitleId) : null;
    if (req.body.salary !== undefined) payload.salary = req.body.salary !== null ? Number(req.body.salary) : null;
    if (req.body.isActive !== undefined) payload.is_active = req.body.isActive;
    if (req.body.isManager !== undefined) payload.is_manager = req.body.isManager;
    if (req.body.isRemoteWorker !== undefined) payload.is_remote_worker = req.body.isRemoteWorker;

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from('employees').update(payload).eq('employee_id', id);
      if (error) {
        throw error;
      }
    }

    if (req.body.address) {
      await upsertEmployeeAddress(id, req.body.address);
    }

    const updatedEmployee = await fetchEmployeeFromDb(id);
    res.json(buildEmployeeResponse(updatedEmployee));
  } catch (error) {
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Employee deletion requires the Supabase SDK to be configured' });
    }

    const { data, error } = await supabase.from('employees').delete().eq('employee_id', req.params.id).select('employee_id');
    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete employee', error: error.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const departments = await fetchDepartmentsFromDb();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
});

router.post('/departments', async (req, res) => {
  try {
    try {
      const result = await query(
        'INSERT INTO departments (department_name, department_code, description) VALUES ($1, $2, $3) RETURNING department_id AS "departmentId", department_name AS "departmentName", department_code AS "departmentCode"',
        [req.body.departmentName, req.body.departmentCode, req.body.description || null]
      );
      res.status(201).json(result.rows[0]);
      return;
    } catch (error) {
      if (!isDbUnavailable(error)) {
        throw error;
      }
    }

    const payload = {
      departmentId: fallbackDepartments.length + 1,
      departmentName: req.body.departmentName,
      departmentCode: req.body.departmentCode,
    };
    fallbackDepartments.push(payload);
    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create department', error: error.message });
  }
});

router.get('/jobtitles', async (req, res) => {
  try {
    const jobTitles = await fetchJobTitlesFromDb();
    res.json(jobTitles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job titles', error: error.message });
  }
});

router.post('/jobtitles', async (req, res) => {
  try {
    try {
      const result = await query(
        'INSERT INTO job_titles (job_title_name, description) VALUES ($1, $2) RETURNING job_title_id AS "jobTitleId", job_title_name AS "jobTitleName", description',
        [req.body.jobTitleName, req.body.description || null]
      );
      res.status(201).json(result.rows[0]);
      return;
    } catch (error) {
      if (!isDbUnavailable(error)) {
        throw error;
      }
    }

    const payload = {
      jobTitleId: fallbackJobTitles.length + 1,
      jobTitleName: req.body.jobTitleName,
      description: req.body.description,
    };
    fallbackJobTitles.push(payload);
    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job title', error: error.message });
  }
});

router.post('/employees/:id/documents', async (req, res) => {
  try {
    const employee = await fetchEmployeeFromDb(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(201).json({ message: 'Document uploaded successfully', documentName: req.body.documentName || 'document' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
});

module.exports = router;
module.exports.router = router;
module.exports.applyEmployeeFilters = applyEmployeeFilters;
module.exports.paginateResults = paginateResults;
module.exports.validateEmployeePayload = validateEmployeePayload;
module.exports.generateEmployeeCode = generateEmployeeCode;
module.exports.buildEmployeeResponse = buildEmployeeResponse;
