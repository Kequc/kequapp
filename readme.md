# Introduction

This is a request listener for use with Node's [`http`](https://nodejs.org/api/http.html) and [`https`](https://nodejs.org/api/https.html) libraries.

When you use `createServer` in a node application it gives you a callback to make use of incoming requests and deliver server responses. This framework is a way to use all of the included features of `createServer` without overloading or changing any behavior or functionality.

### Features

* Full modularity
* Includes body parsing for multipart requests
* Includes simple static file serving
* Support for async await
* Handle any request
* Handle thrown errors
* Handle rendering of any content type
* Respond to or finalize responses in any way
* Does not modify existing node features
* Simple interface with a good learning curve
* Fast
* Includes inject tool for tests
* No dependencies <3

# Initialization

```
npm i kequapp
```

```javascript
const { createServer } = require('http');
const { createApp, createRoute } = require('kequapp');

const app = createApp();

app.add(createRoute(() => {
    return 'Hello world!';
}));

createServer(app).listen(4000, () => {
    console.log('Server running at http://localhost:4000');
});
```

The route shown above will respond to all `'GET'` requests made to the base of the application, at `'/'`. Otherwise our application will respond gracefully with `404` not found.

A route optionally specifies both a method (`'GET'`, `'POST'`, etc...) and a url. Methods can be anything we want, doesn't have to be one of the well-known ones and url is anything we want to act on. Following this is any number of handlers associated with that route.

The `createApp` method returns our request listener but it is also a branch.

# Using createBranch and createRoute

```javascript
const route = createRoute(method = 'GET', url = '/', ...handlers);
// Returns a new route.

const branch = createBranch(url = '/', options = {}, ...handlers);
// Returns a new branch.

app.add(route);
// Returns the `app`.

app.add(branch);
// Returns the `app`.
```

You may specify a branch of the application, which will cause all child routes to adopt the given url, options, and handlers. It's a convenient way to keep our application organized while remaining completely modular.

The application can be structured such that the api is separate from client facing pages for example. Routes in each branch carrying a different set of handlers and behaviors.

```javascript
// handlers
function json ({ res }) {
    res.setHeader('Content-Type', 'application/json');
}

function loggedIn ({ req, context }) {
    if (req.headers.authorization !== 'mike') {
        throw Ex.Unauthorized();
    }
    context.auth = req.headers.authorization;
}

// api
const userBranch = createBranch('/user').add(
    createRoute(() => {
        return { result: [] };
    }),
    createRoute('/:id', ({ params }) => {
        return { userId: params.id };
    })
);

// admin
const adminBranch = createBranch('/admin', loggedIn).add(
    createRoute('/dashboard', ({ context }) => {
        return `Hello admin ${context.auth}!`;
    })
);

// base
app.add(
    createBranch('/api', json).add(
        userBranch
    ),
    adminBranch
);
```

Routes beginning with `'/api'` are returning `'application/json'` formatted responses and routes beginning with `'/admin'` require the user to be logged in.

The endpoints created are the following.

```
GET /api/user
GET /api/user/:id
GET /admin/dashboard
```

This example is verbose. You could simplify the code by omitting the `'/admin'` branch because it only exposes one route.

```javascript
const dashboardRoute = createRoute('/admin/dashboard', loggedIn, ({ context }) => {
    return `Hello admin ${context.auth}!`;
});
```

A route can have any number of handlers, in this case two.

We can respond to a request whenever we want, when we do remaining handlers are ignored. Handlers run in sequence, and any of them may terminate the lifecycle of the request if it returns a value, throws an error, or finalizes the response.

```javascript
// handlers
function authenticated ({ req, res }) {
    // must be authenticated!

    if (!req.headers.authorization) {
        // trigger redirect
        res.statusCode = 302;
        res.setHeader('Location', '/login');

        // finalize response
        res.end();

        // ignores remaining handlers
    }
}

function json ({ res }) {
    res.setHeader('Content-Type', 'application/json');
}

// api
app.add(createRoute('/api/user', authenticated, json, () => {
    return {
        users: [{ name: 'April' }, { name: 'Leo' }]
    };

    // uses renderer
}));
```

# Renderers

In all of these examples we are returning a payload from one of our handlers and not actually rendering anything, or finalizing what's being sent to the client in most cases.

This is what renderers do.

When we `return` something from a handler, a `renderer` is triggered which corresponds to the type of data we are sending.

In most cases we want to send text, or maybe an image, or file. The renderer is chosen based on the `'Content-Type'` header. That is why when we set the `'Content-Type'` to `'application/json'` it is possible to return a simple javascript object from our handler.

The renderer accepts any payload and formats it to be sent to the client.

Some renderers are built-in already, there is one for `'text/plain'` (which is also the default) and `'application/json'`. These can be overridden or extended by providing `renderers` while creating our app or when creating a branch.

```javascript
const { createApp, createRenderer } = require('kequapp');
```

```javascript
const options = {
    renderers: [
        createRenderer('text/html', (payload, { res }) => {
            const html = myMarkupRenderer(payload);
            res.end(html);
        })
    ]
};

const app = createApp(options);
const branch = createBranch(options);
```

It is important to note that if a response isn't finalized at the end of a request lifecycle then a `500` internal server error will be thrown. For examples of how to write a renderer see the existing renderers in this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# Error handling

Much as any other handler there is an `errorHandler`. This makes use of an exception by turning it into useful information that should be sent to the client. The default error handler will return a `'application/json'` formatted response that includes useful information for debugging.

This example manages a very basic custom response.

```javascript
const options = {
    errorHandler (error, { res }) {
        const statusCode = error.statusCode || 500;

        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'text/plain');

        return `${statusCode} ${error.message}`;
    }
};

const app = createApp(options);
```

Errors thrown within the error handler itself or within the renderer used to handle the error response causes a fatal exception and our application will crash. For a better example of how to write an error handler see the existing one in this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

Note that any branch of our application can also specify options as it's first or second parameter.

```javascript
const options = {
    renderers,
    errorHandler
};

createBranch('/user', options, json).add(
    createRoute(() => {
        return { result: [] };
    }),
    createRoute('/:id', ({ params }) => {
        return { userId: params.id };
    })
);
```

An unhandled exception from our application renders a `500` internal server error response to the client by default. If we would like to send an error with a different status code there is a helper tool for that. This makes it easy to utilize any status code `400` and above.

```javascript
const { Ex } = require('kequapp');
```

```javascript
createRoute('/throw-error', () => {
    throw Ex.NotFound();
    throw Ex.NotFound('Custom message', { extra: 'info' });
    // same as
    throw Ex.StatusCode(404);
    throw Ex.StatusCode(404, 'Custom message', { extra: 'info' });
});
```

These methods create errors with correct stacktraces there is no need to use `new`.

# Bundle properties

Above we are making use of bundle properties such as `{ req, res, context }` and others. These properties are provided on every request to each handler in our route.

### req

The node [`req`](https://nodejs.org/api/http.html#class-httpclientrequest) object. It is not modified by this framework so we can rely on the official documentation to use it.

This represents the client request.

### res

The node [`res`](https://nodejs.org/api/http.html#class-httpserverresponse) object. It is not modified by this framework so we can rely on the official documentation to use it.

This represents our response.

### url

If we need to know more about what the client is looking at in the url bar we can do so here. It is a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance generated from the `req` object.

Useful for examining the querystring for example by digging into it's [`searchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).

```javascript
createRoute('/hotels', ({ url }) => {
    const page = url.searchParams.get('page');
    const categories = url.searchParams.getAll('categories');

    // page ~= '2'
    // categories ~= ['ac', 'hottub']
});
```

### context

A place to store variables derived by handlers, we might use these variables elsewhere in the handler lifecycle. We may make changes here whenever we want and populate it with anything.

Useful for storing authentication details for example, or any information that is needed amongst other handlers.

### params

When defining a route we can specify parameters to extract by prefixing a `':'` character in the url. If we specify a route such as `'/user/:userId'` we will have a parameter called `'userId'`. Use a double asterix `'**'` to accept anything for the remainder of the url.

These values are always a string.

### getBody

Node delivers the body of a request in chunks. It is not always necessary to wait for the request to finish before we begin processing it. In most cases we just want the data and therefore a helper method `getBody()` is provided which we may use to await body parameters from the completed request.

```javascript
createRoute('POST', '/user', async ({ getBody }) => {
    const body = await getBody();

    // body ~= {
    //     name: 'April'
    // }

    return `User creation ${body.name}!`;
});
```

This method can be used in many ways so we will look at it in more detail in the next section.

# Body

The `getBody()` method can be used to retrieve, parse, and normalize data from client requests.

### multipart

Causes the function to return both `body` and `files`. If the client didn't send any files, or it wasn't a multipart request the second parameter will be an empty array.

```javascript
createRoute('POST', '/users', async ({ getBody }) => {
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

### raw

The body is processed as minimally as possible and will return a single buffer as it arrived.

When combined with `multipart`, the body is parsed as an array with all parts split into separate buffers with respective headers.

```javascript
createRoute('POST', '/users', async ({ getBody }) => {
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

### skipNormalize

By default the data received is pushed through some body normalization. This is so that the body we receive is in a format we expect and becomes easier to work with.

Disable body normalization with either `raw` or `skipNormalize`.

### arrays

The provided list of fields will be arrays.

Fields which are expected to be arrays must be specified. We only know a field is an array when we receive more than one item with the same name from a client, which creates ambiguity in our object. Therefore fields that do not specify that they are an array will return the first value. Fields which specify they are an array but receive no data will be an empty array.

```javascript
createRoute('POST', '/users', async ({ getBody }) => {
    const body = await getBody({
        arrays: ['ownedPets']
    });

    // body ~= {
    //     ownedPets: ['cat'],
    //     age: '23',
    //     name: 'April'
    // }
});
```

### required

The provided list of fields are not `null` or `undefined`. It's a quick way to throw a `422` unprocessable entity error. These fields might still be empty, but at least something was sent and we know we can operate on them. When a `required` field is also an `arrays` field the array is sure to have at least one value.

### numbers

The provided list of fields will throw a `422` unprocessable entity error if any value is provided which parses into `NaN`. Otherwise they are converted into numbers.

When a `numbers` field is also an `arrays` field the array is all numbers.

### booleans

The provided list of fields are converted into `false` if the value is falsy, `'0'`, or `'false'`, otherwise `true`. When a `booleans` field is also an `arrays` field the array is all booleans.

### validate

After all other normalization is completed, this method is run which further ensures that the data is valid. Returning anything within this method causes a `422` unprocessable entity error.

### postProcess

After all other normalization is completed and `validate` has passed, this method is run to further format the response in any way we need.

The returned value will be the final result.

```javascript
function validate (result) {
    if (result.ownedPets.length > 99) {
        return 'Too many pets';
    }
}

function postProcess (result) {
    return {
        ...result,
        name: result.name.trim()
    };
}

createRoute('POST', '/users', async ({ getBody }) => {
    const body = await getBody({
        arrays: ['ownedPets'],
        required: ['name', 'age'],
        numbers: ['age'],
        validate,
        postProcess
    });

    // body ~= {
    //     ownedPets: ['Maggie', 'Ralph'],
    //     age: 23,
    //     name: 'April'
    // }
});
```

### maxPayloadSize

The max payload size is `1e6` by default (approximately 1mb), if this is exceeded the request will be terminated saving both memory and bandwidth. If you are absolutely sure you want to receive a payload of any size then a value of `Infinity` is accepted.

# Static files

A handler for delivering files relative to our project directory in included. It pairs a directory location with an endpoint, and guesses `Content-Type` from a list of file extensions.

If no `dir` is specified then `'/public'` is used by default. Exclusions can be provided if we want to ignore some files or directories using `exclude`. If there are files included with unusual file extensions more `mime` types can be added.

```javascript
const { staticFiles } = require('kequapp');
```

```javascript
app.add(staticFiles('/assets', {
    dir: '/my-assets-dir',
    exclude: ['/my-assets-dir/private'],
    mime: {
        '.3gp': 'audio/3gpp'
    }
}));
```

We can send a file directly to the client and automatically finalize the response. Mime type is optionally provided as a third parameter.

```javascript
const { sendFile } = require('kequapp');
```

```javascript
app.add(createRoute('/db.json', async ({ req, res }) => {
    // additional functionality here

    await sendFile(res, '/db/my-db.json');
}));
```

# HEAD requests

It is possible to capture `'HEAD'` requests and have them trigger a corresponding `'GET'` lifecycle by making use of the `routeManager`, which is provided as a second parameter in all handlers.

```javascript
createRoute('HEAD', '/**', async ({ url }, routeManager) => {
    const route = routeManager(url.pathname).find(route => route.method === 'GET');

    if (!route) {
        // 404
        throw Ex.NotFound();
    }

    await route.lifecycle();
});
```

The `routeManager` method takes a pathname and looks up compatible routes in your application. If no pathname is provided all routes are returned instead. Routes are returned in order of priority.

There is a convenience helper for this purpose.

```javascript
import { autoHead } from 'kequapp';
```

```javascript
app.add(autoHead());
```

It is the responsibility of our application usually in the renderer, to detect a `'HEAD'` request and not send the body in response. Or to skip functionality not intended when a `'HEAD'` request is received.

```javascript
if (req.method === 'HEAD') {
    res.end();
} else {
    res.end(body);
}
```

The default renderers have this functionality built in.

# Unit testing

We may test our application without starting a server by using the `inject()` tool. The first parameter it accepts is our app, then options largely used to populate the request.

Returned `req` and `res` objects are from the npm [`mock-req`](https://www.npmjs.com/package/mock-req) and [`mock-res`](https://www.npmjs.com/package/mock-res) modules. Ensure you have both installed in your dev dependencies if you are using this tool.

It also returns `getResponse()` which may be used to wait for our application to respond. We could instead inspect what our application is doing in realtime using the `req`, and `res` objects.


```javascript
const { inject } = require('kequapp/inject');
```

```javascript
it('reads the authorization header', async function () {
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
```

### body

All requests are automatically finalized when using `inject()` unless we set `body` to `null`. Doing so will allow us to write to the stream.

The following two examples are the same.

```javascript
const { getResponse } = inject(app, {
    method: 'POST',
    url: '/users',
    headers: {
        'Content-Type': 'application/json'
    },
    body: '{ "name": "April" }'
});

const body = await getResponse();
```

```javascript
const { getResponse, req } = inject(app, {
    method: 'POST',
    url: '/users',
    headers: {
        'Content-Type': 'application/json'
    },
    body: null
});

req.end('{ "name": "April" }');

const body = await getResponse();
```

# Conclusion

And that's it. This should be ample for constructing an application that does anything we could ever want it to do. At least for version `0.2.*` I think it's okay.

Please feel free to contribute or create issue tickets on the github page. Tell me what is missing.
