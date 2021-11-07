# Kequapp

This is the development branch of a request listener for nodejs web apps.

It's intended to be versatile, non-intrusive, and make working with node's server capabilities easier without changing built in functionality.

### Simple Setup

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

```javascript
const { Ex } = require('kequapp');
```

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

app.branch('/user', json)
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

Default renderers are included for `text/plain`, and `application/json`. Renderers are chosen based on the `Content-Type` header set by your application. The above example would cause all routes of the `/user` branch to trigger the `application/json` renderer.

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

### Halting Execution

Any handler can return a `payload`. Doing this halts further execution of the request and triggers rendering immediately. This is similar to interrupting the request by throwing an error or by finalizing the response.

All processing halts if the response has been finalized. This is useful for example instead of rendering output you want to redirect the user to another page.

```javascript
function members({ req, res }) {
    // must be authenticated!
    if (!req.headers.authorization) {
        res.statusCode = 302;
        res.setHeader('Location', '/login');
        // finalize response
        res.end();
    }
}

const membersBranch = app.branch('/members', members);
```

### Parameters

The following parameters are made available to handlers and renderers.

| parameter  | description                                       |
| ---------- | ------------------------------------------------- |
| `req`      | The node [`req`](https://nodejs.org/api/http.html#class-httpclientrequest) object.                            |
| `res`      | The node [`res`](https://nodejs.org/api/http.html#class-httpserverresponse) object.                            |
| `url`      | [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) requested by the client.                      |
| `context`  | Params shared between handler functions.          |
| `params`   | Params extracted from the pathname.               |
| `getBody`  | Function to extract params from the request body. |
| `routes`   | Helper methods describe your app.                 |
| `logger`   | Logger specified during setup.                    |

### Querystring

Querystring values are available from the Javascript [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object found on the `url` object.

```javascript
app.route('/hotels', ({ url }) => {
    const page = url.searchParams.get('page');
    const categories = url.searchParams.getAll('categories');

    // page ~= '2'
    // categories ~= ['ac', 'hottub']
});
```

### Cookies

Cookies are just a special header, managed by the client. It's easier to encode and decode cookies with use of an external library as there is no similar function built into node.

```javascript
const cookie = require('cookie'); // npm i cookie
```

```javascript
function withCookies ({ req, context }) {
    const cookies = cookie.parse(req.headers.cookie);
    // cookies ~= { myCookie: 'hello' }
    context.cookies = cookies;
}

const cookiesBranch = app.branch(withCookies);

app.route('/login', ({ res }) => {
    res.setHeader('Set-Cookie', [cookie.serialize('myCookie', 'hello')]);
});
```

### Body

Node delivers the body of a request in chunks. It is not always necessary to wait for the request to finish before we begin processing it. Therefore a helper method `getBody()` is provided which you may use to await body parameters from the completed request.

```javascript
app.route('POST', '/user', async ({ getBody }) => {
    const body = await getBody();

    // body ~= {
    //     name: 'April'
    // }

    return `User creation ${body.name}!`;
});
```

### Multipart/Raw Body

By passing `multipart` the function will return both a `body` and `files`.

```javascript
app.route('POST', '/user', async ({ getBody }) => {
    const [body, files] = await getBody({ multipart: true });

    // body ~= {
    //     name: 'April'
    // }
    // files ~= [{
    //     headers: {
    //         'content-disposition': 'form-data; name="avatar" filename="my-cat.png"',
    //         'content-type': 'image/png;'
    //     },
    //     mime: 'image/png',
    //     name: 'avatar',
    //     filename: 'my-cat.png',
    //     data: Buffer <...>
    // }]

    return `User creation ${body.name}!`;
});
```

By passing `raw` the body is processed as minimally as possible, returning a single buffer as it arrived. When combined with `multipart`, an array is returned with all parts as separate buffers with respective headers.

```javascript
app.route('POST', '/user', async ({ getBody }) => {
    const parts = await getBody({ raw: true, multipart: true });

    // parts ~= [{
    //     headers: {
    //         'content-disposition': 'form-data; name="name"'
    //     },
    //     data: Buffer <...>
    // }, {
    //     headers: {
    //         'content-disposition': 'form-data; name="avatar" filename="my-cat.png"',
    //         'content-type': 'image/png;'
    //     },
    //     data: Buffer <...>
    // }]

    return `User creation ${parts[0].data.toString()}!`;
});
```

### Body Normalization

It is required to specify which body parameters are `arrays`.

Otherwise the server only knows a field is an array when it receives more than one item, which creates ambiguity in the structure of the body. Fields that do not specify an array will return the first value.

Additional normalization is available. Specifying `required` ensures that the field is not `null` or `undefined` (though might be empty). There are also `numbers` and `booleans`. Full control is offered using `validate()` and `postProcess()`.

Note body normalization is ignored with `raw` or `skipNormalize`.

```javascript
function validate (result) {
    if (result.ownedPets.length > 99) {
        return 'Too many pets';
    }
    if (result.ownedPets.length < 1) {
        return 'Not enough pets!';
    }
}

function postProcess (result) {
    return {
        ...result,
        name: result.name.trim()
    };
}

app.route('POST', '/user', async ({ getBody }) => {
    const body = await getBody({
        arrays: ['ownedPets'],
        numbers: ['age'],
        required: ['name'],
        validate,
        postProcess
    });

    // body ~= {
    //     ownedPets: ['cat'],
    //     age: 23,
    //     name: 'April'
    // }
});
```

| parameter       | description                                    |
| ----------      | ---------------------------------------------- |
| `arrays`        | Value is returned as an array.                 |
| `required`      | Value or values are not `null` or `undefined`. |
| `numbers`       | Value or values are converted to numbers.      |
| `booleans`      | Value or values are converted to booleans.     |
| `skipNormalize` | Skip normalization.                            |

Further clarification. Required will throw an error if the value is missing. Arrays return an empty array if no value is provided. Numbers will throw an error if any value is provided which parses into `NaN`. Booleans return false if no value is provided, the value is falsy, `'0'`, or `'false'`.

### Exceptions

Error generation is available by importing the `Ex` utility. Any thrown error will be caught by the error handler and return a `500` status code, this utility enables you to utilize status codes `400` and above.

These methods create errors with correct stacktraces there is no need to use `new`.

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

The default error handler returns a json formatted response containing helpful information for debugging. It can be overridden by defining an `errorHandler` during instantiation. The returned value will be sent to the renderer again for processing.

Errors thrown inside of the error handler or within the renderer it uses will cause a fatal exception.

This example sends a very basic custom response.

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

A rudimentary `staticFiles()` handler can be used to deliver files relative to your project directory. This utility makes use of the `**` parameter as defined by your route to build a valid path.

By default the `/public` directory is used.

```javascript
const { staticFiles } = require('kequapp');
```

```javascript
app.route('/assets/**', staticFiles({
    dir: '/my-assets-dir',
    exclude: ['/my-assets-dir/private']
}));
```

If more control is needed a similar `sendFile()` helper is available.

```javascript
const { sendFile } = require('kequapp');
```

```javascript
app.route('/db.json', async function ({ req, res }) {
    const pathname = '/db/my-db.json';
    await sendFile(req.method, res, pathname);
});
```

### Unit Tests

It is possible to test your application without spinning up a server using the `inject()` tool. The first parameter is your app, then options largely used to populate the request. An optional `overrides` parameter can be provided to override configuration options from your app.

Returned `req` and `res` objects are from the npm `mock-req` and `mock-res` modules respectively. Ensure you have both [`mock-req`](https://www.npmjs.com/package/mock-req) and [`mock-res`](https://www.npmjs.com/package/mock-res) installed in your project.

It also returns `getResponse()` which is a utility you may use to wait for your application to respond. Alternatively you may inspect what your application is doing in realtime using the `req`, and `res` objects.

```javascript
const assert = require('assert');
const { inject } = require('kequapp/inject');
```

```javascript
it('reads the authorization header', async function () {
    const { getResponse, res } = inject(app, {
        overrides: { logger },
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

A `body` parameter can be provided for the request. All requests are automatically finalized when using `inject()` unless you set `body` to `null`. Doing so will allow you to write to the stream.

The following two examples are the same.

```javascript
const { getResponse, res } = inject(app, {
    method: 'POST',
    url: '/user',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    body: '{ "name": "April" }'
});

const body = await getResponse();
```

```javascript
const { getResponse, req, res } = inject(app, {
    method: 'POST',
    url: '/user',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    body: null
});

req.end('{ "name": "April" }');

const body = await getResponse();
```
