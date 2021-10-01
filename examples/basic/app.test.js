const assert = require('assert');
const inject = require('../../src/inject.js'); // 'kequserver/inject'
const app = require('./app.js');

it('reads parameters from the url', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/user/21'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'userId: 21!');
});

it('reads query parameters', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/user?name=tony&age=21'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'Query {"name":"tony","age":"21"}');
});

it('reads the authorization header', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/admin/dashboard',
        headers: {
            Authorization: 'mike'
        }
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'Hello admin mike!');
});

it('returns an error if auth is invalid', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/admin/dashboard',
        headers: {
            Authorization: 'lisa'
        }
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(body.error.statusCode, 401);
    assert.strictEqual(body.error.message, 'Unauthorized');
});

it('reads the body of a request', async function () {
    const { getBody, req, res } = inject(app, util.log(), {
        method: 'POST',
        url: '/user',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: null
    });

    req.end('{ "name": "april" }');

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'User creation april!');
});

it('throws an error when trying to access missing route', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/users/how-are-ya'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(body.error.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found: /users/how-are-ya');
});
