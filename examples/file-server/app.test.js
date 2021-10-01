const assert = require('assert');
const inject = require('../../src/inject.js'); // 'kequserver/inject'
const app = require('./app.js');

it('can access the root', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(res.getHeader('Content-Length'), body.length);
    assert.strictEqual(body, 'Hello world!');
});

it('can open an image', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/assets/cat.gif'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'image/gif; charset=utf-8');
    assert.ok(res.getHeader('Content-Length') > 0);
    assert.strictEqual(res.getHeader('Content-Length'), body.length);
});

it('returns only head when requested', async function () {
    const { getBody, res } = inject(app, util.log(), {
        method: 'HEAD',
        url: '/assets/cat.gif'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'image/gif; charset=utf-8');
    assert.ok(res.getHeader('Content-Length') > 0);
    assert.strictEqual(body.length, 0);
});

it('can open a css file', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/assets/css/test.css'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/css; charset=utf-8');
    assert.ok(res.getHeader('Content-Length') > 0);
    assert.strictEqual(res.getHeader('Content-Length'), body.length);
    assert.strictEqual(body, 'body {\n    margin: 0;\n}\n');
});

it('throws an error when trying to access root directory', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/assets'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});

it('throws an error when trying to access nested directory', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/assets/css'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(body.error.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});

it('throws an error when trying to access missing file', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/assets/does-not-exist.exe'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});

it('throws an error when trying to access excluded file', async function () {
    const { getBody, res } = inject(app, util.log(), {
        url: '/assets/private.txt'
    });

    const body = await getBody();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});
