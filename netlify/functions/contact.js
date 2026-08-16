// Netlify serverless function: contact form -> Telegram Bot API.
// Secrets (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) are read ONLY from
// server-side environment variables. They must never be hardcoded or
// shipped to the browser.
const https = require('https');

const TELEGRAM_API_HOST = 'api.telegram.org';
const MAX_NAME = 100;
const MAX_EMAIL = 150;
const MAX_MESSAGE = 2000;

function postTelegram(token, chatId, text) {
  const payload = JSON.stringify({
    chat_id: chatId,
    text: text,
    disable_web_page_preview: true
  });

  return new Promise(function (resolve, reject) {
    const req = https.request(
      {
        hostname: TELEGRAM_API_HOST,
        path: '/bot' + token + '/sendMessage',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000
      },
      function (res) {
        let body = '';
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function () {
          let ok = res.statusCode >= 200 && res.statusCode < 300;
          if (ok) {
            try {
              const parsed = JSON.parse(body);
              ok = parsed && parsed.ok === true;
            } catch (e) {
              ok = false;
            }
          }
          if (ok) {
            resolve(true);
          } else {
            reject(new Error('Telegram API responded with status ' + res.statusCode));
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', function () {
      req.destroy(new Error('Telegram API timeout'));
    });
    req.write(payload);
    req.end();
  });
}

function validate(payload) {
  const errors = {};
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name) {
    errors.name = 'Please enter your name.';
  } else if (name.length < 2) {
    errors.name = 'Your name must be at least 2 characters.';
  } else if (name.length > MAX_NAME) {
    errors.name = 'Name must be ' + MAX_NAME + ' characters or fewer.';
  }

  if (!email) {
    errors.email = 'Please enter your email.';
  } else if (!emailRe.test(email)) {
    errors.email = 'Please enter a valid email address.';
  } else if (email.length > MAX_EMAIL) {
    errors.email = 'Email must be ' + MAX_EMAIL + ' characters or fewer.';
  }

  if (!message) {
    errors.message = 'Please enter a message.';
  } else if (message.length > MAX_MESSAGE) {
    errors.message = 'Message must be ' + MAX_MESSAGE + ' characters or fewer.';
  }

  return { valid: Object.keys(errors).length === 0, errors: errors, name: name, email: email, message: message };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, errors: { form: 'Invalid request body.' } }) };
  }

  // Honeypot anti-spam: if a bot fills the hidden field, silently accept but do nothing.
  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  const result = validate(payload);
  if (!result.valid) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, errors: result.errors }) };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: 'Contact form is not configured.' }) };
  }

  const text =
    '🔔 New Portfolio Contact\n\n' +
    'Name: ' + result.name + '\n\n' +
    'Email: ' + result.email + '\n\n' +
    'Message:\n' + result.message + '\n\n' +
    'Source: Portfolio\n' +
    'Time: ' + new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');

  try {
    await postTelegram(token, chatId, text);
  } catch (e) {
    // Log the failure server-side only; never return internals to the client.
    console.error('Telegram send failed:', e.message);
    return { statusCode: 502, body: JSON.stringify({ ok: false, message: 'Could not send your message.' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};