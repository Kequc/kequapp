import 'kequtest';
import assert from 'assert';
import { inject } from '../../src/main'; // 'kequapp'
import app from './app';

it('can access the root', async () => {
    const { getResponse, res } = inject(app, {
        url: '/'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/html');
    assert.strictEqual(body, `<html>
    <body>Hello world!</body>
</html>
`);
});

it('can open an image', async () => {
    const { getResponse, res } = inject(app, {
        url: '/assets/cat.gif'
    });

    const body = await getResponse();
    console.log(body);

    assert.strictEqual(res.getHeader('Content-Type'), 'image/gif');
    assert.ok(body.length > 0);
});

it('returns only head when requested', async () => {
    const { getResponse, res } = inject(app, {
        method: 'HEAD',
        url: '/assets/cat.gif'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'image/gif');
    assert.strictEqual(body.length, 0);
});

it('can open a css file', async () => {
    const { getResponse, res } = inject(app, {
        url: '/assets/css/test.css'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/css');
    assert.strictEqual(body, 'body {\n    margin: 0;\n}\n');
});

it('can access the root directory index', async () => {
    const { getResponse, res } = inject(app, {
        url: '/assets'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/html');
    assert.strictEqual(body, `<html>
    <body>Hello world!</body>
</html>
`);
});

it('throws error accessing directory without index', async () => {
    const { getResponse, res } = inject(app, {
        url: '/assets/css'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json');
    assert.strictEqual(body.error.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});

it('throws error accessing missing file', async () => {
    const { getResponse, res } = inject(app, {
        url: '/assets/does-not-exist.exe'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});

it('throws error accessing excluded file', async () => {
    const { getResponse, res } = inject(app, {
        url: '/assets/private.txt'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});
