const https = require('https');

const data = JSON.stringify({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hola' }],
  max_tokens: 10
});

const req = https.request('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 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'
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
