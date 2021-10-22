import assert from 'assert';
import { inject } from '../../src/test'; // 'kequapp/test'
import app from './app';

const logger = util.logger();

it('can access the root', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(res.getHeader('Content-Length'), body.length);
    assert.strictEqual(body, 'Hello world!');
});

it('can open an image', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/assets/cat.gif'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'image/gif; charset=utf-8');
    assert.ok(res.getHeader('Content-Length') > 0);
    assert.strictEqual(res.getHeader('Content-Length'), body.length);
});

it('returns only head when requested', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        method: 'HEAD',
        url: '/assets/cat.gif'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'image/gif; charset=utf-8');
    assert.ok(res.getHeader('Content-Length') > 0);
    assert.strictEqual(body.length, 0);
});

it('can open a css file', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/assets/css/test.css'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/css; charset=utf-8');
    assert.ok(res.getHeader('Content-Length') > 0);
    assert.strictEqual(res.getHeader('Content-Length'), body.length);
    assert.strictEqual(body, 'body {\n    margin: 0;\n}\n');
});

it('throws error accessing root directory', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/assets'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});

it('throws error accessing nested directory', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/assets/css'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(body.error.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});

it('throws error accessing missing file', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/assets/does-not-exist.exe'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});

it('throws error accessing excluded file', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/assets/private.txt'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});
