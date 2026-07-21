const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 5000;

function req(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const opts = {
      hostname: API_HOST,
      port: API_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const r = http.request(opts, (res) => {
      let out = '';
      res.on('data', (c) => out += c);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: out }));
    });

    r.on('error', (e) => reject(e));
    if (body) r.write(body);
    r.end();
  });
}

(async () => {
  try {
    console.log('1) POST /api/employees with missing required fields');
    let r = await req('POST', '/api/employees', {});
    console.log(r.statusCode, r.body);

    console.log('\n2) POST /api/employees with valid payload');
    const payload = {
      firstName: 'Auto',
      lastName: 'Tester',
      username: 'autotest',
      email: 'autotest+1@example.com',
      departmentId: 1,
      jobTitleId: 1,
      gender: 'Other',
    };
    r = await req('POST', '/api/employees', payload);
    console.log(r.statusCode, r.body);
    let createdId = null;
    try { createdId = JSON.parse(r.body).employeeId || JSON.parse(r.body).employee?.employeeId; } catch(e){}

    console.log('\n3) PUT /api/employees/:id with missing required fields (expect 400)');
    if (createdId) {
      r = await req('PUT', `/api/employees/${createdId}`, {});
      console.log(r.statusCode, r.body);

      console.log('\n4) PUT /api/employees/:id with valid payload (expect 200)');
      const update = {
        firstName: 'AutoUpdated',
        lastName: 'TesterUpdated',
        username: 'autotest2',
        email: 'autotest+updated@example.com',
        departmentId: 2,
        jobTitleId: 2,
      };
      r = await req('PUT', `/api/employees/${createdId}`, update);
      console.log(r.statusCode, r.body);
    } else {
      console.log('Could not determine created employee id; skipping PUT tests.');
    }
  } catch (error) {
    console.error('Test script error:', error.message || error);
    process.exit(1);
  }
  process.exit(0);
})();
