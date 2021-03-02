const assert = require('assert');
const app = require('./app.js');

app._opt.log = util.log();

it('returns the expected result', async function () {
  const { getBody, res } = app.inject('/user/21', 'get');

  const body = await getBody();

  assert.strictEqual(res.getHeader('content-type'), 'text/plain');
  assert.strictEqual(body, 'userId: 21!');
});

it('reads the authorization header', async function () {
  const { getBody, req, res } = app.inject('/admin/dashboard', 'get');

  req.setHeader('Authorization', 'mike');

  const body = await getBody();

  assert.strictEqual(res.getHeader('content-type'), 'text/plain');
  assert.strictEqual(body, 'Hello admin mike!');
});

it('reads the body of a request', async function () {
  const { getBody, req, res } = app.inject('/user', 'post');

  req.setHeader('content-type', 'application/json');
  req.end('{ "name": "april" }');

  const body = await getBody();

  assert.strictEqual(res.getHeader('content-type'), 'text/plain');
  assert.strictEqual(body, 'User creation april!');
});
