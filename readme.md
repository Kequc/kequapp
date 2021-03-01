Kequserver
===

This is the development branch of an experimental request listener for basic nodejs servers. It's intended to be non-intrusive and versatile as possible.

### Setup

```
npm i kequserver
```

```javascript
const http = require('http');
const kequserver = require('kequserver')

const app = kequserver();
const server = http.createServer(app);

app.route(['get'], () => {
  return 'Hello world!';
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});

```

### Route

Routes are defined using `app.route`. The path parameter is optional, followed by an array of incoming method names you would like the route to listen for. Followed by any number of functions which define the request lifecycle.

Optionally each middleware function can return an object as a result. That object gets merged through all middleware as the `context` parameter.

The final function which is run is the handle. The handle returns the payload that should be given to the renderer.

```javascript
app.route('/about', ['get'], () => {
  return 'Page here';
});

function loggedIn ({ req }) {
  return {
    user: req.getHeader('authorization');
  }
}

app.route('/user/admin', ['get'], loggedIn, ({ context }) => {
  return `Hello ${context.user}!`;
});
```

### Branch

Branches are defined using `app.branch`. The path parameter is optional, followed by any number of functions. It returns a branch of the application which will adopt all middleware and pathname prefix. By itself this does not create a route, it will be used in conjunction with routes.

```javascript
app.branch('/user', loggedIn)
  .route('/admin', ['get'], ({ context }) => {
    return `Hello ${context.user}!`;
  })
  .route('/logout', ['get'], ({ context }) => {
    return `Goodbye ${context.user}!`;
  });
```

### Use

Middleware is added to the current branch using `app.use`. The path parameter is optional, followed by any number of functions which define the request lifecycle.

Often useful at the base of an application to set common middleware.

```javascript
app.use(({ res }) => {
  res.setHeader('content-type', 'application/json');
});
```

### Renderers

Default renderers are included for `text/plain`, and `application/json`. Renderers are chosen based on the `content-type` header. The above example would cause all routes of the application to use `application/json` rendered responses.

You can override renderers or add your own using `renderers` during instantiation. This is the final step of a request's lifecycle and should explicitly finalize the response.

```javascript
const app = kequserver({
  renderers: {
    'text/html': ({ payload, res }) => {
      const html = myMarkupRenderer(payload);
      res.end(html);
    }
  }
});
```

### Errors

Error generation is available using `app.errors`. A direct alias for `app` is `rL`, which is an abbreviation of 'requestListener'. Any thrown error will be caught by the error handler but will default to a `500` status code. This utility handles the full spectrum of status codes.

```javascript
app.route('/about', ['get'], ({ rL }) => {
  // 404
  throw rL.errors.NotFound('Custom message');
});
```

### Error handler

The default error handler returns json containing helpful information for debugging. It can be overridden using `errorHandler` during instantiation. It has `error` as well as `req` and `res` parameters. The return value will be sent back to the renderer for processing.

This example sends a very basic response.

```javascript
const app = kequserver({
  errorHandler: ({ error, res }) => {
    const statusCode = error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('content-type', 'text/plain');

    return `${statusCode} ${error.message}`
  }
});
```
