const http = require('http');

const sql = `SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'  -- Change 'public' to your schema name
  AND table_type = 'BASE TABLE'
ORDER BY table_name;`;

const data = JSON.stringify({ query: sql });

const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/sql/run',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(opts, (res) => {
  let buf = '';
  res.on('data', (c) => (buf += c));
  res.on('end', () => {
    try {
      const json = JSON.parse(buf);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(buf);
    }
  });
});

req.on('error', (e) => console.error('err', e));
req.write(data);
req.end();
