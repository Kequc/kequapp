# Introduction

This is a request listener for use with the Node [`http`](https://nodejs.org/api/http.html) and [`https`](https://nodejs.org/api/https.html) library.

When you use `createServer` in a node application it gives you a callback to make use of incoming requests and deliver server responses. This framework is a way to use all of the included features of `createServer` without overloading or changing any behavior or functionality.

**Features**

* Modular framework
* CORS by default
* Body parsing for multipart requests
* Async await everywhere
* Any request
* Any response
* Static file serving
* Does not modify node features or functionality
* Manageable learning curve
* Fast
* Inject for unit tests
* No dependencies <3

# Hello world!

```
npm i kequapp
```

```javascript
// hello world!

const { createServer } = require('http');
const { createApp, createRoute } = require('kequapp');

const app = createApp().add(
    createRoute(() => {
        return 'Hello world!';
    })
);

createServer(app).listen(4000, () => {
    console.log('Server running at http://localhost:4000');
});
```

This will respond to all `'GET'` requests made to the base of the application at `'/'`. Otherwise will respond gracefully with a `404` not found error.

Every branch of our application exposes `add()`. This is used to extend it with functionality. In simple cases this will be a route or another branch.

A route can specify both a method (`'GET'`, `'POST'`, etc...) and path. The method doesn't have to be one of the well-known ones. The path is a location, following these are any number of handle functions.

# Use `createHandle()`

```
# createHandle((bundle) => unknown): (bundle) => unknown;
```

A helper method which adds types. It only returns the function provided and is the same as using the function directly.

```javascript
const { createHandle } = require('kequapp');
```

```javascript
// createHandle

const json = createHandle(({ res }) => {
    res.setHeader('Content-Type', 'application/json');
});

const loggedIn = createHandle(({ req, context }) => {
    if (req.headers.authorization !== 'mike') {
        throw Ex.Unauthorized();
    }

    context.auth = req.headers.authorization;
});
```

# Use `createBranch()` and `createRoute()`

```javascript
const { createBranch, createRoute } = require('kequapp');
```

```
# createBranch(url = '/', ...handles: Handle[]): Branch;
# createRoute(method = 'GET', url = '/', ...handles: Handle[]): Route;
```

A branch of the application will cause routes to adopt the given path and handles. For example the application can be structured such that the api is a branch separate from client facing pages and carry different functionality.

```javascript
// createBranch createRoute

app.add(
    createBranch('/api', json).add(
        createBranch('/user').add(
            createRoute(() => {
                return { result: [] };
            }),
            createRoute('/:id', ({ params }) => {
                return { userId: params.id };
            })
        )
    ),
    createBranch('/admin', loggedIn).add(
        createRoute('/dashboard', ({ context }) => {
            return `Hello admin ${context.auth}!`;
        })
    )
);
```

The example is better served by splitting these branches or routes into separate files for organization and readability.

It is possible to simplify the example as it is verbose. We can omit the `'/api'` branch because it only exposes one branch, and we can omit the `'/admin'` branch because it only exposes one route.

```javascript
// createBranch createRoute

app.add(
    createBranch('/api/user', json).add(
        createRoute(() => {
            return { result: [] };
        }),
        createRoute('/:id', ({ params }) => {
            return { userId: params.id };
        })
    ),
    createRoute('/admin/dashboard', loggedIn, ({ context }) => {
        return `Hello admin ${context.auth}!`;
    })
);
```

Routes beginning with `'/api'` are returning `'application/json'` formatted responses and those with `'/admin'` require the user to be logged in.

Our endpoints created are the following.

```
GET /api/user
GET /api/user/:id
GET /admin/dashboard
```

# Use `createErrorHandler()`

```javascript
const { createErrorHandler } = require('kequapp');
```

```
# createErrorHandler(contentType = '*', handle: ErrorHandlerHandle): ErrorHandler;
```

As any other handle there is an `errorHandler`. This turns an exception into useful information that should be rendered. The default one will return a `'application/json'` formatted response that includes useful information for debugging.

This example manages a very basic custom response.

```javascript
// createErrorHandler

app.add(
    createErrorHandler('text/*', (error, { res }) => {
        const statusCode = error.statusCode || 500;
        res.statusCode = statusCode;
        return `${statusCode} ${error.message}`;
    })
);
```

Errors thrown within the error handler itself or within the renderer used to handle the error causes a fatal exception and our application will crash. For a better example of how to write an error handler see the existing one in this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# Use `createRenderer()`

```javascript
const { createRenderer } = require('kequapp');
```

```
# createRenderer(contentType: string, handle: RendererHandle): Renderer;
```

In the examples so far we are returning a payload and not rendering anything or finalizing the response.

This is because when we `return` from a handle, a `renderer` is triggered which corresponds to the `'Content-Type'` header we have set. That is why after we set the `'Content-Type'` to `'application/json'` it is possible to return a simple javascript object.

Some renderers are built-in already, there is one for `'text/*'` (which is also the default) and `'application/json'`. These can be overridden or extended by adding your own.

```javascript
// createRenderer

app.add(
    createRenderer('text/html', (payload, { res }) => {
        const html = myMarkupRenderer(payload);
        // finalize response
        res.end(html);
    })
)
```

A renderer is always the last step of a request lifecycle.

We need to be sure a response is finalized otherwise a `500` internal server error will be thrown by our application. For examples of how to write a renderer see the existing ones in this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# Use `Ex()`

```javascript
const { Ex } = require('kequapp');
```

```
# Ex.<NAME>(message?: string, ...info: any[]): new Error;
# Ex.StatusCode(statusCode: number, message?: string, ...info: any[]): new Error;
```

An unhandled exception from our application returns a `500` internal server error response by default. If we would like to send an error with a different status code there is a helper tool.

```javascript
// Ex

createRoute('/throw-error', () => {
    throw Ex.NotFound();
    throw Ex.NotFound('Custom message', { extra: 'info' });
    // same as
    throw Ex.StatusCode(404);
    throw Ex.StatusCode(404, 'Custom message', { extra: 'info' });
});
```

This makes it easy to utilize any status code `400` and above. These methods create errors with correct stacktraces there is no need to use `new`.

# Responding to requests

We can respond to a request whenever we want, remaining handles are ignored. Handles run in sequence, and any of them may terminate the lifecycle of a request by returning a value, throwing an error, or finalizing the response.

```javascript
// Respond to request

const authenticated = createHandle(({ req, res }) => {
    // must be authenticated!

    if (!req.headers.authorization) {
        // cause redirect
        res.statusCode = 302;
        res.setHeader('Location', '/login');

        // finalize response
        // ignore remaining handles
        res.end();
    }
});

app.add(
    createRoute('/api/user', authenticated, json, () => {
        // trigger a renderer
        return {
            users: [{ name: 'April' }, { name: 'Leo' }]
        };
    })
);
```

# Bundle

Properties such as `{ req, res, context }` are used throughout the above examples. These properties are provided on every request and provided to each handle, renderer, and error handler.

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

# Use `getBody()`

The `getBody()` method can retrieve, parse, and normalize data from client requests.

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

# Use `sendFile()` and `staticFiles()`

```javascript
const { sendFile, staticFiles } = require('kequapp');
```

```
# sendFile(res: Res, asset: string, mime?: string): void;
# staticFiles(url = '/**', options = {}): Route;
```

We can send a file directly to the client and automatically finalize a response. Mime type can optionally be provided as a third parameter otherwise the correct header to send is guessed based on file extension.

```javascript
// sendFile

createRoute('/db.json', async ({ req, res }) => {
    // ...etc
    await sendFile(res, '/db/my-db.json');
});
```

For a directory of resources `staticFiles()` pairs a directory location with a route that delivers files relative to our project directory. If no `dir` is specified then `'/public'` is used by default. Exclusions can be provided if we want to ignore some files or directories using `exclude`. If there are files included with unusual file extensions additional `mime` types can be added.

```javascript
// staticFiles

app.add(staticFiles('/assets', {
    dir: '/my-assets-dir',
    exclude: ['/my-assets-dir/private'],
    mime: {
        '.3gp': 'audio/3gpp'
    }
}));
```

# `OPTIONS` requests and CORS

A `OPTIONS` request is handled automatically by our application.

By default all routes attach a `'Access-Control-Allow-Origin'` header with a value of `'*'`. In addition, `OPTIONS` requests are given `'Access-Control-Allow-Headers'` and `'Access-Control-Allow-Methods'` headers. To change this behavior we add a handler to the branch which overrides them.

Modifying `'Access-Control-'` headers in this way is how we customize all aspects of CORS requests. It is possible to augment `OPTIONS` requests specifically by adding a wildcard route and including it in our branch, they do not need to be finalized as it will be done by our application if we don't.

```javascript
// CORS

const strict = createHandle(({ res }) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://foo.com');
});

const customCors = createRoute('OPTIONS', '/**', ({ res }) => {
    res.setHeader('Access-Control-Max-Age', 86400);
    res.setHeader('Vary', 'Access-Control-Request-Headers');
    // ...etc
});

createBranch('/my-cors-api', strict).add(
    customCors
);
```

We can disable CORS by removing the header in a handle, and if we really want to we can capture `OPTIONS` requests to neutralize them.

```javascript
// NO CORS

const noCors = createHandle(({ res }) => {
    res.removeHeader('Access-Control-Allow-Origin');
});

createBranch('/my-nocors-api', noCors).add(
    createRoute('OPTIONS', '/**', () => {
        throw Ex.NotFound();
    })
);
```

# `HEAD` requests

A `HEAD` request is handled automatically by our application.

By default if no route matches a `HEAD` request our application will look for a corresponding `GET` route and execute that one instead. It becomes the responsibility of our application therefore to detect a `HEAD` request and treat it appropriately, this is already done automatically by the library's built-in renderers.

To disable automatic `HEAD` behavior capture those requests and throw an error.

```javascript
// NO HEAD

createBranch('/my-nohead-api').add(
    createRoute('HEAD', '/**', () => {
        throw Ex.NotFound();
    })
);
```

# Use `inject()`

```javascript
const { inject } = require('kequapp');
```

```
# inject(app: Kequapp, options: {}): { req, res, getResponse };
```

We may unit test our application without starting a server by using the `inject()` tool. The first parameter is our app, then options used to populate the request.

Returned `req` value is a simulations of node's built-in [`req`](https://nodejs.org/api/http.html#class-httpclientrequest) object and is a stream which can be written to. Returned `res` value os a simulation of node's built-in [`res`](https://nodejs.org/api/http.html#class-httpserverresponse) object and is a stream which can be read from.

The returned `getResponse()` tool may be used to wait for our application to finish and then parse the response. We could optionally not use it and instead inspect what our application is doing in realtime using the `req`, and `res` objects directly.

```javascript
// inject

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

All requests are automatically finalized when using the `inject()` tool unless we set `body` to `null`. Doing this will allow us to write to the stream when more precise testing is required.

The following two examples are the same.

```javascript
// body

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
// stream body

const { getResponse, req } = inject(app, {
    method: 'POST',
    url: '/users',
    headers: {
        'Content-Type': 'application/json'
    },
    body: null
});

// finalize request
req.end('{ "name": "April" }');

const body = await getResponse();
```

Not that a `getResponse()` will not resolve until the request is finalized.

# Conclusion

And that's it. This should be ample for constructing an application that does anything we could ever want it to do. At least for version `0.2.*` I think it's okay.

Please feel free to contribute or create issue tickets on the github page. Tell me what is missing.
