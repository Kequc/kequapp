Kequserver
===

This is the development branch of an experimental request listener for basic nodejs servers. It's intended to be versatile and non-intrusive.

### Setup

```
npm i kequserver
```

```javascript
const http = require('http');
const { createApp } = require('kequserver');

const app = createApp();
const server = http.createServer(app);

app.route(['get'], () => {
  return 'Hello world!';
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});

```

### Route

Routes are defined using `route()`. The pathname is optional, followed by an array of incoming method names you would like the route to listen for. Followed by any number of functions which define the request lifecycle.

Optionally each middleware function can return an object as a result. That object gets merged through all middleware as the `context` parameter.

The final function which is run is the handle. The handle returns the payload that should be handed off to the renderer.

```javascript
app.route('/about', ['get'], () => {
  return 'Page here';
});

function loggedIn ({ req }) {
  return {
    auth: req.getHeader('authorization');
  }
}

app.route('/user/admin', ['get'], loggedIn, ({ context }) => {
  return `Hello admin ${context.auth}`;
});
```

### Branch

Branches are defined using `branch()`. The path parameter is optional, followed by any number of functions. It returns a branch of the application which will adopt all middleware and a pathname prefix. By itself this does not create a route, it will be used in conjunction with routes.

```javascript
app.branch('/user', loggedIn)
  .route('/:id', ['get'], ({ params }) => {
    return `userId: ${params.id}!`;
  })
  .route('/admin', ['get'], ({ context }) => {
    // Same as previous example
    return `Hello admin ${context.auth}`;
  });
```

### Middleware

Middleware is added to the current branch using `middleware()`. The pathname prefix is optional, followed by any number of functions which define the middleware you would like.

This affects all routes in the current branch, forcing routes to start with a given prefix and run the given middleware.

Often useful at the base of an application to perform tasks for all routes.

```javascript
app.middleware(({ res }) => {
  res.setHeader('content-type', 'application/json');
});
```

### Renderers

Default renderers are included for `text/plain`, and `application/json`. Renderers are chosen based on the `content-type` header. The above example would cause all routes of the application to return `application/json` rendered responses.

You can override renderers or add your own using `renderers` during instantiation. This is the final step of a request's lifecycle and should explicitly finalize the response.

```javascript
const app = kequserver({
  renderers: {
    'text/html': (payload, { res }) => {
      const html = myMarkupRenderer(payload);
      res.end(html);
    }
  }
});
```

### Parameters

| parameter | description |
| - | - |
| `req` | The node `req` parameter. |
| `res` | The node `res` parameter. |
| `errors` | Http error creation helper. |
| `method` | Method provided by the client in lowercase. |
| `pathname` | Pathname provided by the client. |
| `params` | Params extracted from pathname. |
| `query` | Params extracted from querystring. |
| `body` | Params extracted from body. |
| `context` | Params returned from middleware functions. |

### Errors

Error generation is available using the `errors` parameter. Any thrown error will be caught by the error handler and will default to a `500` status code, this utility is a helper enabling you to utilise the full spectrum of status codes.

```javascript
app.route('/about', ['get'], ({ errors }) => {
  // 404
  throw errors.NotFound('Custom message');
});
```

### Error handler

The default error handler returns json containing helpful information for debugging. It can be overridden using `errorHandler` during instantiation. The returned value will be sent to the renderer again for processing.

Errors thrown inside of the error handler or the renderer chosen to parse the error handler's response will cause a fatal exception.

This example sends a very basic response.

```javascript
const app = kequserver({
  errorHandler: (error, { res }) => {
    const statusCode = error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('content-type', 'text/plain');

    return `${statusCode} ${error.message}`;
  }
});
```
