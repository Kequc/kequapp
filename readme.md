Kequserver
===

This is the development branch of an experimental request listener for basic nodejs servers. It's intended to be versatile and non-intrusive.

### Basic Setup

```
npm i kequserver
```

```javascript
const { createServer } = require('http');
const { createApp } = require('kequserver');

const app = createApp();

app.route('/', () => {
  return 'Hello world!';
});

createServer(app).listen(4000, () => {
  console.log('Server running on port 4000');
});
```

### Route

Routes are defined using the `route()` method.

Method is optional default is `'GET'`, pathname is optional default is `'/'`, followed by any number of functions which define the request lifecycle.

Any function can return a `payload`. Doing so halts further execution of the request lifecycle and triggers the renderer immediately. This is similar to interrupting the request by throwing an error.

The final function which is run hands execution over to the renderer whether or not a `payload` is returned.

```javascript
function loggedIn ({ req, context, errors }) {
  if (req.headers.authorization !== 'mike') {
    throw errors.Unauthorized();
  }

  context.auth = req.headers.authorization;
}

app.route('/user', () => {
  return 'User list';
});

app.route('/user/:id', ({ params }) => {
  return `userId: ${params.id}!`;
});

app.route('/admin/dashboard', loggedIn, ({ context }) => {
  return `Hello admin ${context.auth}!`;
});
```

### Branch

Branches are defined using the `branch()` method.

Pathname prefix is optional default is `'/'`, followed by any number of middleware functions. It returns a branch of the application which will adopt all middleware and use a pathname prefix. By itself this does not create a route, it will be used in conjunction with routes.

```javascript
// same as above example
app.branch('/user')
  .route(() => {
    return 'User list';
  })
  .route('/:id', ({ params }) => {
    return `userId: ${params.id}!`;
  });

app.branch('/admin', loggedIn)
  .route('/dashboard', ({ context }) => {
    return `Hello admin ${context.auth}!`;
  });
```

### Middleware

Middleware is added to the current branch using the `middleware()` method.

Pathname prefix is optional default is `'/'`, followed by any number of functions which define the middleware you would like to use. This affects all routes in the current branch, forcing routes to start with a given prefix and run the given middleware.

Often useful at the base of an application to interact with all routes.

```javascript
app.middleware(({ res }) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
});

app.branch('/admin')
  .middleware(loggedIn)
  .route('/dashboard', ({ context }) => {
    return {
      myJson: `Hello admin ${context.auth}!`
    };
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

A consideration is that if the `res` stream is no longer writable all processing halts. This is useful for example if instead of rendering output or throwing an error you want to redirect the user to another page.

```javascript
function membersOnly ({ req, res }) {
  // must be authenticated
  if (!req.headers.authorization) {
    res.statusCode = 302;
    res.setHeader('Location', '/login');
    res.end();
    // halt processing the request
  }
}

const membersBranch = app.branch('/members', membersOnly);
```

### Parameters

The following parameters are made available to middleware and handlers.

| parameter | description |
| - | - |
| `req` | The node `req` parameter. |
| `res` | The node `res` parameter. |
| `errors` | Http error creation helper. |
| `method` | Method provided by the client in uppercase. |
| `pathname` | Pathname provided by the client. |
| `getBody` | Function to extract params from the request body. |
| `params` | Params extracted from the pathname. |
| `query` | Params extracted from the querystring. |
| `context` | Params shared between middleware functions. |

### Body

Node delivers the body of a request in chunks. It is not always necessary to wait for the request to finish before we begin processing it. Therefore a helper method `getBody()` is provided which you can use to await body parameters from the completed request.

```javascript
app.route('POST', '/user', async ({ getBody }) => {
  const body = await getBody();
  return `User creation ${body.name}!`;
});
```

### Cookies

I recommend use of an external library.

```javascript
const cookie = require('cookie'); // npm i cookie

app.middleware(({ req }) => {
  const cookies = cookie.parse(req.headers.cookie);
  // cookies ~= { myCookie: 'hello' }
});

app.route('/login', ({ res }) => {
  res.setHeader('Set-Cookie', [
    cookie.serialize('myCookie', 'hello')
  ]);
});
```

### Errors

Error generation is available using the `errors` parameter. Any thrown error will be caught by the error handler and will use a `500` status code, this helper utility enables you to utilise all status codes `400` and above.

These methods will create a new error with the correct stacktrace there is no need to use `new`.

```javascript
app.route('/throw-error', ({ errors }) => {
  throw errors.StatusCode(404);
  throw errors.StatusCode(404, 'Custom message', { extra: 'info' });
  // same as
  throw errors.NotFound();
  throw errors.NotFound('Custom message', { extra: 'info' });
});
```

### Error Handling

The default error handler returns json containing helpful information for debugging. It can be overridden by defining an `errorHandler` during instantiation. The returned value will be sent to the renderer again for processing.

Errors thrown inside of the error handler or within the renderer chosen to parse the error handler's payload will cause a fatal exception.

This example sends a very basic response.

```javascript
const app = createApp({
  errorHandler: (error, { res }) => {
    const statusCode = error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    return `${statusCode} ${error.message}`;
  }
});
```

### Unit Tests

It is possible to test your application without spinning up a server using the `inject()` tool. The first parameter is your app. The options you provide are used largely to populate the request. The returned `req` and `res` objects are from the npm `mock-req` and `mock-res` modules respectively.

It also returns `getBody()` which is a utility you may use to wait for your application to respond. Alternatively you can inspect what your application is doing making use of the `req`, and `res` objects in realtime.

```javascript
const inject = require('kequserver/inject');
```

```javascript
it('returns the expected result', async function () {
  const { getBody, res } = inject(app, {
    url: '/user/21'
  });

  const body = await getBody();

  assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
  assert.strictEqual(body, 'userId: 21!');
});

it('reads the authorization header', async function () {
  const { getBody, res } = inject(app, {
    url: '/admin/dashboard',
    headers: {
      Authorization: 'mike'
    }
  });

  const body = await getBody();

  assert.strictEqual(res.getHeader('Content-Type'), 'text/plain; charset=utf-8');
  assert.strictEqual(body, 'Hello admin mike!');
});
```

Optionally a `body` parameter can be provided as a convenience instead of writing to the stream, the following two examples are the same.

```javascript
it('reads the body of a request', async function () {
  const { getBody, req, res } = inject(app, {
    method: 'POST',
    url: '/user',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  req.end('{ "name": "april" }');

  const body = await getBody();

  assert.strictEqual(body, 'User creation april!');
});

it('reads the body of a request', async function () {
  const { getBody, res } = inject(app, {
    method: 'POST',
    url: '/user',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: '{ "name": "april" }'
  });

  const body = await getBody();

  assert.strictEqual(body, 'User creation april!');
});
```
