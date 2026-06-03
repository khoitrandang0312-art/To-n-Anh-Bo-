const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  questionIds: ['Q1', 'Q2', 'Q3']
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-exam',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    fs.writeFileSync('test_output.json', body);
    console.log(`Status: ${res.statusCode}`);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
