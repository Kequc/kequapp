# Kequapp

This is the development branch of an experimental request listener for basic nodejs servers. It's intended to be versatile and non-intrusive.

### Basic Setup

```
npm i kequapp
```

```javascript
const { createServer } = require('http');
const { createApp } = require('kequapp');

const app = createApp();

app.route('/', () => {
    return 'Hello world!';
});

createServer(app).listen(4000, () => {
    console.log('Server running on port 4000');
});
```

### Routing

Routes are defined using `route()`. Method is optional default is `'GET'`, path is optional default is `'/'`, followed by any number of handlers which define the request lifecycle.

Branches are defined using `branch()`. Path prefix is optional default is `'/'`, followed by any number of handlers. It returns a branch of the application which will adopt all handlers and use the given path prefix. By itself this does not create a route, it will be used in conjunction with routes.

Handlers are added to the current branch using `middleware()`. Path prefix is optional default is `'/'`, followed by any number of handlers you would like to use. This affects all routes in the current branch. Often useful on the `app` instance to interact with all routes.

```javascript
function json ({ res }) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function loggedIn ({ req, context }) {
    if (req.headers.authorization !== 'mike') {
        throw Ex.Unauthorized();
    }
    context.auth = req.headers.authorization;
}

app.branch('/user')
    .middleware(json)
    .route(() => {
        return { result: [] };
    })
    .route('/:id', ({ params }) => {
        return { userId: params.id };
    });

app.route('/admin/dashboard', loggedIn, ({ context }) => {
    return `Hello admin ${context.auth}!`;
});
```

### Renderers

Default renderers are included for `text/plain`, and `application/json`. Renderers are chosen based on the `Content-Type` header set by your application. The above example would cause all routes of the application to render `application/json`.

You can override renderers or add your own by defining `renderers`. These act as the final step of a request's lifecycle and should explicitly finalize the response.

```javascript
const app = createApp({
    renderers: {
        'text/html': (payload, { res }) => {
            const html = myMarkupRenderer(payload);
            res.end(html);
        }
    }
});
```

### Halt Execution

Any handler can return a `payload`. Doing so halts further execution of the request lifecycle and triggers rendering immediately. This is similar to interrupting the request by throwing an error or finalizing the response.

If the `res` stream is no longer writable all processing halts. This is useful for example if instead of rendering output or throwing an error you want to redirect the user to another page.

```javascript
function membersOnly({ req, res }) {
    // must be authenticated
    if (!req.headers.authorization) {
        res.statusCode = 302;
        res.setHeader('Location', '/login');
        res.end(); // halts processing the request
    }
}

const membersBranch = app.branch('/members', membersOnly);
```

### Parameters

The following parameters are made available to handlers and renderers.

| parameter  | description                                       |
| ---------- | ------------------------------------------------- |
| `req`      | The node `req` parameter.                         |
| `res`      | The node `res` parameter.                         |
| `url`      | Url requested by the client.                      |
| `context`  | Params shared between handler functions.          |
| `params`   | Params extracted from the pathname.               |
| `query`    | Params extracted from the querystring.            |
| `getBody`  | Function to extract params from the request body. |
| `logger`   | Logger specified during setup.                    |

### Body

Node delivers the body of a request in chunks. It is not always necessary to wait for the request to finish before we begin processing it. Therefore a helper method `getBody()` is provided which you can use to await body parameters from the completed request.

```javascript
app.route('POST', '/user', async ({ getBody }) => {
    const [body, files] = await getBody();

    // body ~= {
    //     name: 'april'
    // }
    // files ~= [{
    //     headers: {
    //         'content-disposition': 'form-data; name="avatar" filename="my-cat.png"'
    //         'content-type': 'image/png;',
    //     },
    //     mime: 'image/png',
    //     name: 'avatar',
    //     filename: 'my-cat.png',
    //     data: Buffer <...>
    // }]

    return `User creation ${body.name}!`;
});
```

By default `getBody()` will try to parse the request as best it can and provide you a simple result. There are several formatting options for the data retrieved from `getBody()` these are accessed by providing a `BodyFormat` option.

```javascript
const { BodyFormat } = require('kequapp');
```

```javascript
app.route('POST', '/user', async ({ getBody }) => {
    const parts = await getBody(BodyFormat.RAW);

    // parts ~= [{
    //     headers: {
    //         'content-disposition': 'form-data; name="name"'
    //     },
    //     mime: 'text/plain',
    //     name: 'name',
    //     filename: undefined,
    //     data: Buffer <...>
    // }, {
    //     headers: {
    //         'content-disposition': 'form-data; name="avatar" filename="my-cat.png"'
    //         'content-type': 'image/png;',
    //     },
    //     mime: 'image/png',
    //     name: 'avatar',
    //     filename: 'my-cat.png',
    //     data: Buffer <...>
    // }]

    return `User creation ${parts[0].data.toString()}!`;
});
```

The following `BodyFormat` options are available.

| option          | description                                                  |
| --------------- | ------------------------------------------------------------ |
| `DEFAULT`       | Body is processed by it's content type.                      |
| `RAW`           | The body is returned as it arrived in a single buffer.       |
| `MULTIPART`     | Body and files are returned separately.                      |
| `RAW_MULTIPART` | Each part is returned as a separate buffer.                  |

### Cookies

I recommend use of an external library.

```javascript
const cookie = require('cookie'); // npm i cookie
```

```javascript
app.middleware(({ req }) => {
    const cookies = cookie.parse(req.headers.cookie);
    // cookies ~= { myCookie: 'hello' }
});

app.route('/login', ({ res }) => {
    res.setHeader('Set-Cookie', [cookie.serialize('myCookie', 'hello')]);
});
```

### Exceptions

Error generation is available importing the `Ex` helper. Any thrown error will be caught by the error handler and will use a `500` status code, this helper utility enables you to utilize all status codes `400` and above.

These methods will create a new error with the correct stacktrace there is no need to use `new`.

```javascript
const { Ex } = require('kequapp');
```

```javascript
app.route('/throw-error', () => {
    throw Ex.StatusCode(404);
    throw Ex.StatusCode(404, 'Custom message', { extra: 'info' });
    // same as
    throw Ex.NotFound();
    throw Ex.NotFound('Custom message', { extra: 'info' });
});
```

### Exception Handling

The default error handler returns json containing helpful information for debugging. It can be overridden by defining a `errorHandler` during instantiation. The returned value will be sent to the renderer again for processing.

Errors thrown inside of the error handler or within the renderer chosen to parse the error handler's payload will cause a fatal exception.

This example sends a very basic response.

```javascript
const app = createApp({
    errorHandler (error, { res }) {
        const statusCode = error.statusCode || 500;

        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');

        return `${statusCode} ${error.message}`;
    }
});
```

### Static Files

A rudimentary `staticFiles()` handler can be used to deliver files relative to your project directory. This utility makes use of the `wildcards` parameter as defined by your route to build a valid path.

By default the `./public` directory is used.

```javascript
const { staticFiles } = require('kequapp');
```

```javascript
app.route('/assets/**', staticFiles({
    dir: './my-assets-dir',
    exclude: ['./my-assets-dir/private']
}));
```

If more control is needed a similar `sendFile()` helper is available.

```javascript
const { sendFile } = require('kequapp');
```

```javascript
app.route('/db.json', async function ({ req, res }) {
    const pathname = './db/my-db.json';
    await sendFile(req.method, res, pathname);
});
```

### Unit Tests

It is possible to test your application without spinning up a server using the `inject()` tool. The first parameter is your app, then a config override for your app, followed by options largely used to populate the request. Returned `req` and `res` objects are from the npm `mock-req` and `mock-res` modules respectively.

It also returns `getResponse()` which is a utility you may use to wait for your application to respond. Alternatively you can inspect what your application is doing making use of the `req`, and `res` objects in realtime.

```javascript
const { inject } = require('kequapp/test');
```

```javascript
it('returns the expected result', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        url: '/user/21'
    });

    const body = await getResponse();

    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
    assert.strictEqual(body, 'userId: 21!');
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
```

A `body` parameter can optionally be provided as an easy way of finalizing the request. All requests are automatically finalized when they are initiated with `inject()` unless you set `body` to `null`. Doing so will allow you to write to the stream manually.

The following two examples are the same.

```javascript
it('reads the body of a request', async function () {
    const { getResponse, res } = inject(app, { logger }, {
        method: 'POST',
        url: '/user',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: '{ "name": "april" }'
    });

    const body = await getResponse();

    assert.strictEqual(body, 'User creation april!');
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

    assert.strictEqual(body, 'User creation april!');
});
```
