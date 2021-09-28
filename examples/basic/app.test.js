const assert = require('assert');
const inject = require('../../inject.js'); // 'kequserver/inject'
const app = require('./app.js');

app._options.logger = util.log();

it('returns the expected result', async function () {
  const { getBody, res } = inject(app, {
    url: '/user/21'
  });

  const body = await getBody();

  assert.strictEqual(res.getHeader('content-type'), 'text/plain');
  assert.strictEqual(body, 'userId: 21!');
});

it('reads the authorization header', async function () {
  const { getBody, res } = inject(app, {
    url: '/admin/dashboard',
    headers: {
      authorization: 'mike'
    }
  });

  const body = await getBody();

  assert.strictEqual(res.getHeader('content-type'), 'text/plain');
  assert.strictEqual(body, 'Hello admin mike!');
});

it('returns an error if auth is invalid', async function () {
  const { getBody, res } = inject(app, {
    url: '/admin/dashboard',
    headers: {
      authorization: 'lisa'
    }
  });

  const body = await getBody();

  assert.strictEqual(res.getHeader('content-type'), 'application/json');
  assert.strictEqual(body.error.statusCode, 401);
  assert.strictEqual(body.error.message, 'Unauthorized');
});

it('reads the body of a request', async function () {
  const { getBody, req, res } = inject(app, {
    method: 'POST',
    url: '/user',
    headers: {
      'content-type': 'application/json'
    }
  });

  req.end('{ "name": "april" }');

  const body = await getBody();

  assert.strictEqual(res.getHeader('content-type'), 'text/plain');
  assert.strictEqual(body, 'User creation april!');
});
