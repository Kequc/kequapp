import 'kequtest';
import assert from 'assert';
import { inject } from '../../src/inject'; // 'kequapp/inject'
import app from './app';

it('reads parameters from the url', async () => {
    const { getResponse, res } = inject(app, {
        url: '/users/21'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(body, 'userId: 21!');
});

it('reads query parameters', async () => {
    const { getResponse, res } = inject(app, {
        url: '/users?name=tony&age=21'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(body, 'Query {"name":"tony","age":"21"}');
});

it('reads the authorization header', async () => {
    const { getResponse, res } = inject(app, {
        url: '/admin/dashboard',
        headers: {
            Authorization: 'mike'
        }
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(body, 'Hello admin mike!');
});

it('returns an error if auth is invalid', async () => {
    const { getResponse, res } = inject(app, {
        url: '/admin/dashboard',
        headers: {
            Authorization: 'lisa'
        }
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json');
    assert.strictEqual(body.error.statusCode, 401);
    assert.strictEqual(body.error.message, 'Unauthorized');
});

it('reads the body of a request', async () => {
    const { getResponse, req, res } = inject(app, {
        method: 'POST',
        url: '/users',
        headers: {
            'Content-Type': 'application/json'
        },
        body: null
    });

    req.end('{ "name": "april" }');

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(body, 'User creation april!');
});

it('reads the body of a multipart request', async () => {
    const { getResponse, req, res } = inject(app, {
        method: 'POST',
        url: '/users/secrets',
        headers: {
            'Content-Type': 'multipart/form-data; boundary=------------------------d74496d66958873e'
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

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(body, 'April is 23 and secrets.txt has contents of the file!');
});

it('reads the body of a request using shorthand', async () => {
    const { getResponse, res } = inject(app, {
        method: 'POST',
        url: '/users',
        headers: {
            'Content-Type': 'application/json'
        },
        body: '{ "name": "april" }'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(body, 'User creation april!');
});

it('throws an error when trying to access missing route', async () => {
    const { getResponse, res } = inject(app, {
        url: '/how-are-ya'
    });

    const body = await getResponse();
    console.log(body);

    assert.strictEqual(res.getHeader('Content-Type'), 'application/json');
    assert.strictEqual(body.error.statusCode, 404);
    assert.strictEqual(body.error.message, 'Not Found');
});
