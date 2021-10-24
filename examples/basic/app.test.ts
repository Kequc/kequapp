import 'kequtest';
import assert from 'assert';
import { inject } from '../../src/test'; // 'kequapp/test'
import app from './app';

const logger = util.logger();

it('reads parameters from the url', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/user/21'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'userId: 21!');
});

it('reads query parameters', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/user?name=tony&age=21'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'Query {"name":"tony","age":"21"}');
});

it('reads the authorization header', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/admin/dashboard',
        headers: {
            Authorization: 'mike'
        }
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'Hello admin mike!');
});

it('returns an error if auth is invalid', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/admin/dashboard',
        headers: {
            Authorization: 'lisa'
        }
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(body.error.statusCode, 401);
    assert.strictEqual(body.error.message, 'Unauthorized');
});

it('reads the body of a request', async function () {
    const { getResponse, req, res } = inject(app, { logger }, {
        method: 'POST',
        url: '/user',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: null
    });

    req.end('{ "name": "april" }');

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'User creation april!');
});

it('reads the body of a multipart request', async function () {
    const { getResponse, req, res } = inject(app, { logger }, {
        method: 'POST',
        url: '/user/secrets',
        headers: {
            'Content-Type': 'multipart/form-data; charset=utf-8; boundary=------------------------d74496d66958873e'
        },
        body: null
    });

    req.end(`--------------------------d74496d66958873e
Content-Disposition: form-data; name="name"

April
--------------------------d74496d66958873e
Content-Disposition: form-data; name="age"

23
--------------------------d74496d66958873e
Content-Disposition: form-data; name="secret"; filename="secrets.txt"
Content-Type: text/plain

contents of the file
--------------------------d74496d66958873e--`);

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'April is 23 and secrets.txt has contents of the file!');
});

it('reads the body of a request using shorthand', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        method: 'POST',
        url: '/user',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: '{ "name": "april" }'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'User creation april!');
});

it('throws an error when trying to access missing route', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/users/how-are-ya'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json; charset=utf-8');
    assert.strictEqual(body.error.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found: /users/how-are-ya');
});
