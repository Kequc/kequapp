<img alt="kequtest" src="https://github.com/Kequc/kequapp/blob/0.2-wip/logo.png?raw=true" width="142" height="85" />

Versatile, non-intrusive, tiny webapp framework

# Introduction

This is a request handler for Node's [`http`](https://nodejs.org/api/http.html) and [`https`](https://nodejs.org/api/https.html) libraries.

This framework is easy to learn and use. It manages three stages of a request first handling the route, then errors, and finally rendering a response to the client. Each step is as non-obtrusive as possible, so that we can focus on creating applications from Node's built-in features.

**Features**

* Modular framework
* CORS by default
* Body parsing for multipart requests
* Static file serving
* Async await everywhere
* Does not modify node features or functionality
* Any request to deliver any response
* Unit testing tool
* Fast
* No dependencies <3

```
npm i kequapp
```

# Concepts

**handle**

A route is composed of one or more handles which run in sequence. Handles are responsible for all of the heavy lifting and contain most of our application code.

**route**

Each route is a self contained collection of handles, these direct the lifecycle of a request at a given url. Add them to a branch or the base of an application.

**branch**

Used for distributing behavior across multiple routes and helping to stay organized during development. We might separate a json api from client facing pages for example, and want different behaviors which are common to either area. Add them to another branch or the base of an application.

**error handler**

An appropriate error handler is invoked whenever a handle throws an exception. They behave much the same as a handle but only recover from the exception and should not throw. Add them to a branch or the base of an application.

**renderer**

An appropriate renderer is invoked whenever a handle or error handler returns a value apart from `undefined`. These behave much the same as a handle but are always the last step of a request and should deliver a response to the client. Add them to a branch or to the base of an application.

# Hello world!

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

This example responds to all `'GET'`, `'OPTIONS'`, and `'HEAD'` requests made to the base of our application at `'/'`. Otherwise a `404` not found error will be returned. The reason all three respond to requests made at the base of our application at `'/'` is that is the default for new routes.

Defining `'HEAD'` and `'OPTIONS'` routes will override default behavior.

```javascript
app.add(
    createRoute('HEAD', '/car', () => {
        // custom HEAD
    }),
    createRoute('OPTIONS', '/car', () => {
        // custom OPTIONS
    }),
    createRoute('/car', () => {
        return 'Hello car!';
    })
);
```

We do not need to create any error handler or renderer for this example because our app comes with some defaults. We will look at how to create our own shortly.

# # createHandle()

```javascript
const { createHandle } = require('kequapp');
```

```
# createHandle(handle: Handle): Handle;
```

This is useful for building handles that exist outside of any scope, for example in another file. If we are using TypeScript this conveniently provides types, otherwise it is the same as simply defining a function.

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

Handles can be asyncronous functions and when used always run in sequence. In these examples the `json` handle sets the `'Content-Type'`, and `loggedIn` checks for an `authorization` header from the client.

# # createRoute()

```javascript
const { createRoute } = require('kequapp');
```

```
# createRoute(method: string, url: Pathname, ...handles: Handle[]): Route;
# createRoute(url: Pathname, ...handles: Handle[]): Route;
# createRoute(method: string, ...handles: Handle[]): Route;
# createRoute(...handles: Handle[]): Route;
```

A route may specify a method (`'GET'`, `'POST'`, etc.) and url, followed by any number of handles. The url is a pathname that the route should respond to.

When provided the url must always start with `'/'`.

```javascript
// createRoute

createRoute('POST', '/admin/user', loggedIn, () => {
    // do something here

    return `User created!`;
});
```

This example has two handles. One which we defined earlier called `loggedIn` and a second that returns a value that will be sent to the renderer.

# # createBranch()

```javascript
const { createBranch } = require('kequapp');
```

```
# createBranch(url: Pathname, ...handles: Handle[]): Branch;
# createBranch(...handles: Handle[]): Branch;
```

A branch of the application will cause routes to adopt the given url and handles.

Every branch of our application exposes `add()`. This is an important function used to extend the branch with added functionality. Usually this will be a route, another branch, an error handler, or renderer. All can be added in any order, they are organized later by the framework.

```javascript
// createBranch

createBranch().add(
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

Routes beginning with `'/api'` are returning `'application/json'` formatted responses, we can see those routes are returning javascript objects, these are for the renderer.

Routes beginning with `'/admin'` require the user to be logged in. Three routes are defined and therefore our endpoints are the following:

```
GET /api/user
GET /api/user/:id
GET /admin/dashboard
```

This example is verbose. We can omit the `'/api'` branch because it only exposes one branch, and the `'/admin'` branch because it only exposes one route, leaving us the same result with less code.

```javascript
// createBranch

createBranch().add(
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

# # createErrorHandler()

```javascript
const { createErrorHandler } = require('kequapp');
```

```
# createErrorHandler(contentType: string, url: Pathname, handle: Handle): ErrorHandler;
# createErrorHandler(url: Pathname, handle: Handle): ErrorHandler;
# createErrorHandler(contentType: string, handle: Handle): ErrorHandler;
# createErrorHandler(handle: Handle): ErrorHandler;
```

If no content type is provided the error handler will be used for all content types.

This turns an exception into useful information that should be sent to the client. We may returnin a value to invoke a renderer or finalize the response directly inside the error handler. The default one structures a json formatted response with helpful information for debugging.

The following is a very simple plain text formatted one.

```javascript
// createErrorHandler

createErrorHandler('text/*', (error, { res }) => {
    const statusCode = error.statusCode || 500;
    res.statusCode = statusCode;
    return `${statusCode} ${error.message}`;
});
```

Errors thrown within an error handler or the renderer it invokes will cause a fatal exception and an empty `body` will be delivered to the client.

For a good example of how to write error handlers see this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# # createRenderer()

```javascript
const { createRenderer } = require('kequapp');
```

```
# createRenderer(contentType: string, url: Pathname, handle: Handle): ErrorHandler;
# createRenderer(url: Pathname, handle: Handle): ErrorHandler;
# createRenderer(contentType: string, handle: Handle): ErrorHandler;
# createRenderer(handle: Handle): ErrorHandler;
```

If no content type is provided the renderer will be used for all content types.

Renderers are responsible for finalizing the response to the client. It is the last stage of a request and otherwise an empty `body` will be delivered to the client.

There are default renderers that come built-in to the application for both `'text/*'` and `'application/json'`, however these can be overridden by defining our own.

The following is a simple example of what an html renderer might look like.

```javascript
// createRenderer

createRenderer('text/html', (payload, { res }) => {
    const html = myMarkupRenderer(payload);

    // finalize response
    res.end(html);
});
```

For good examples of how to write renderers see this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# # Ex.()

```javascript
const { Ex } = require('kequapp');
```

```
# Ex.<NAME>(message: string, ...info: unknown[]): new Error;
# Ex.<NAME>(message: string): new Error;
# Ex.<NAME>(): new Error;

# Ex.StatusCode(statusCode: number, message: string, ...info: unknown[]): new Error;
# Ex.StatusCode(statusCode: number, message: string): new Error;
# Ex.StatusCode(statusCode: number): new Error;
```

An unhandled exception from our application builds a `500` internal server error. If we would like to build an error with a different status code there is a helper tool.

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

This makes it easy to utilize any status code `400` and above. These methods create errors with a correct stacktrace there is no reason to use `new`.

# Respond to a request

Handles may terminate a request at any time in one of three ways:

| | |
| ---- | ---- |
| **Return a value** | A renderer is invoked. |
| **Throw an exception** | An error handler is invoked. |
| **Finalize the response** |

Finalizing the response is for ultimate control. The error handler and renderer are ultimately not required as we could theoretically finalize every request by the end of every route manually.

```javascript
// Respond to a request

const authenticated = createHandle(({ req, res }) => {
    // must be authenticated!

    if (!req.headers.authorization) {
        // cause redirect
        res.statusCode = 302;
        res.setHeader('Location', '/login');

        // finalize response ignore remaining handles
        res.end();
    }
});

createRoute('/api/user', authenticated, json, () => {
    // return a value invoke a renderer
    return {
        users: [{ name: 'April' }, { name: 'Leo' }]
    };
});
```

In this example if the client did not provide an `authorization` header, the `authenticated` handle will finalize the response. This terminates the request and skips all remaining handles. Otherwise the `json` handle sets `'Content-Type'` of the response to `'application/json'`.

The last remaining handle returns a value. This invokes a renderer best matching the `'Content-Type'` of the response, in this example a renderer matching `'application/json'` would be used.

# Bundle

Properties such as `req`, `res`, and `context` are found throughout the examples above. These properties are generated for every request and are available in every route, renderer, and error handler.

* **`req`**

The node [`ClientRequest`](https://nodejs.org/api/http.html#class-httpclientrequest) object. It is not modified by this framework so we can rely on the official documentation to use it. This represents the client request.

* **`res`**

The node [`ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) object. It is not modified by this framework so we can rely on the official documentation to use it. This represents the server response.

* **`url`**

If we need to know more about what the client is looking at in the url bar we can do so here. It is a [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance generated from the `req` object.

Useful for examining the querystring for example by digging into it's [`searchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).

```javascript
createRoute('/hotels', ({ url }) => {
    const page = url.searchParams.get('page');
    const categories = url.searchParams.getAll('categories');

    // page ~= '2'
    // categories ~= ['ac', 'hottub']
});
```

* **`context`**

A place to store variables derived by handles, we might use these variables elsewhere in our code. Changes can be made here whenever we want and it may be populated with anything.

Maybe authentication details, a user object, or any data that's used in other places.

* **`params`**

When defining a route we can specify parameters to extract by prefixing a colon `'/:'` character in the url. If we specify a route such as `'/user/:userId'` we will have a parameter called `'userId'`. Use a double asterix `'/**'` to accept anything for the remainder of the url.

Param values are always a string.

* **`getBody()`**

This method can be used in many ways so the next section will look at it in detail.

# # getBody()

Node delivers the body of a request in chunks. It is not necessary to wait for the request to finish before we begin processing it. In most cases we just want the data and therefore a helper method `getBody()` is provided which we may use to await body parameters from the completed request.

```javascript
// getBody

createRoute('POST', '/user', async ({ getBody }) => {
    const body = await getBody();

    // body ~= {
    //     name: 'April'
    // }

    return `User creation ${body.name}!`;
});
```

It takes an options object which can be used to parse and normalize a client request into useful data a large assortment of different ways.

* **`multipart`**

Causes the function to return both `body` and `files`. If the client didn't send any files, or it wasn't a multipart request the second parameter will be an empty array.

```javascript
// multipart

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

* **`raw`**

The body is processed as minimally as possible and returns a single buffer. When combined with `multipart`, the body is parsed into an array of separate buffers with their respective headers.

```javascript
// raw

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

* **`skipNormalize`**

By default the data received is pushed through some body normalization. This is so that the body we receive is in a format we expect and is therefore easier to work with.

Disable body normalization with either `raw` or `skipNormalize`.

* **`arrays`**

The provided list of fields are converted into arrays.

Fields that are not specified will return only the first value. This is because the framework only knows that a field is an array when it receives more than one value for a given name from the client. It would be inconvenient if parameters are sometimes arrays, and therefore we are explicit here.

```javascript
// arrays

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

* **`required`**

The provided list of fields are not `null` or `undefined`. It's a quick way to throw a `422` unprocessable entity error. These fields might still be empty, but at least something was sent and we know we can operate on them. When a `required` field is also an `arrays` field the array is sure to have at least one value.

* **`numbers`**

The provided list of fields will throw a `422` unprocessable entity error if any value is provided which parses into `NaN`. Otherwise they are converted into numbers.

When a `numbers` field is also an `arrays` field the array is all numbers.

* **`booleans`**

The provided list of fields are converted into `false` if the value is falsy, `'0'`, or `'false'`, otherwise `true`. When a `booleans` field is also an `arrays` field the array is all booleans.

* **`validate`**

After normalization, this method further ensures the validity of the data. Returning anything from this function throws a `422` unprocessable entity error.

```javascript
// validate

createRoute('POST', '/users', async ({ getBody }) => {
    const body = await getBody({
        arrays: ['ownedPets'],
        numbers: ['age'],
        validate (result) {
            if (result.ownedPets.length > 99) {
                return 'Too many pets';
            }
        }
    });

    // body ~= {
    //     ownedPets: ['Maggie', 'Ralph'],
    //     age: 23
    // }
});
```

We know it is safe to use `result.ownedPets.length` in this example because it is listed as an `arrays` field and therefore certain to be an array.

* **`postProcess`**

After normalization is complete and `validate` has passed, this method further formats the response in any way we need. The returned value will be the final result.

```javascript
// postProcess

createRoute('POST', '/users', async ({ getBody }) => {
    const body = await getBody({
        arrays: ['ownedPets'],
        required: ['name', 'age'],
        numbers: ['age'],
        postProcess (result) {
            return {
                ...result,
                name: result.name.trim()
            };
        }
    });

    // body ~= {
    //     ownedPets: ['Maggie', 'Ralph'],
    //     age: 23,
    //     name: 'April'
    // }
});
```

We know it is safe to call `result.name.trim()` in this example because it is listed as a `required` field and therefore certain to exist.

* **`maxPayloadSize`**

The max payload size is `1e6` (approximately 1mb) by default. If this payload size is exceeded by the client the request will be terminated saving our application both memory and bandwidth. If we are absolutely sure we want to receive a payload of any size then a value of `Infinity` is accepted.

# # sendFile()

```javascript
const { sendFile } = require('kequapp');
```

```
# sendFile(res: Res, asset: string, mime: string): void;
# sendFile(res: Res, asset: string): void;
```

Send a file to the client and finalize the response immediately. This is asyncronous and must be awaited otherwise the application might get confused as it continues processing the request. If a mime type is not provided the correct `'Content-Type'` header is guessed based on file extension.

```javascript
// sendFile

createRoute('/db.json', async ({ req, res }) => {
    // ...etc
    await sendFile(res, '/db/my-db.json');
});
```

# # staticFiles()

```javascript
const { staticFiles } = require('kequapp');
```

```
# staticFiles(url: Pathname, options = Options): Route;
# staticFiles(options: Options): Route;
# staticFiles(url: Pathname): Route;
# staticFiles(): Route;
```

Pair a `url` and a given set of `options` with a directory.

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

If no `dir` is specified then `'/public'` is used by default. Exclusions can be provided if we want to ignore some files or directories using `exclude`.

The correct `'Content-Type'` header is guessed based on file extension. If there are files in the directory with unusual file extensions then additional `mime` types can be added.


# CORS and `OPTIONS` requests

An `'Access-Control-Allow-Origin'` header with value of `'*'` is attached by default to all responses.

To change this behavior we use a handle to override it. The easiest place to override this header is at the base of the application. The `createApp` method accepts handles to use for all routes.

```javascript
// CORS

const cors = createHandle(({ res }) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://foo.com');
});

createApp(cors);
```

An important consideration, the default `'OPTIONS'` route resides at the base of our application. It will not know about any handles we have added to branches. So if we change headers in a branch that are relevant to `OPTIONS` requests, we should add an `'OPTIONS'` route to that location.

That way all routes, including `'OPTIONS'`, will use the provided handles.

```javascript
// CORS

createBranch('/cors', cors).add(
    createRoute('OPTIONS', '/**')
);
```

Creating a standalone route makes it possible to define only handles that are needed as `OPTIONS` routes are often much simpler than other routes in the branch.

The following is a standalone `OPTIONS` route which would use the same url as the example above, while still correctly setting the `'Access-Control-Allow-Origin'` header.

```javascript
// CORS

createRoute('OPTIONS', '/cors/**', cors);
```

The framework attaches two additional headers to `OPTIONS` responses.

`'Access-Control-Allow-Headers'` will identify all headers that were requested by the client. `'Access-Control-Allow-Methods'` will correctly identify all methods available at the given url.

Additional customization can be made in `OPTIONS` routes.

```javascript
// CORS

const options = createHandle(({ res }) => {
    const allowMethods = res.getHeader('Access-Control-Allow-Methods');

    if (allowMethods) {
        // remove POST from the response
        res.setHeader('Access-Control-Allow-Methods', allowMethods
            .split(', ')
            .filter(method => method !== 'POST')
            .join(', '));
    }

    res.setHeader('Access-Control-Max-Age', 86400);
    res.setHeader('Vary', 'Access-Control-Request-Headers');
});

createRoute('OPTIONS', '/cors/**', cors, options);
```

The same could be done anywhere, including at the base of the application.

```javascript
// CORS

createApp(cors).add(
    createRoute('OPTIONS', '/**', options)
);
```

The following would remove default CORS funcationality.

```javascript
// CORS

const noCors = createHandle(({ res }) => {
    res.removeHeader('Access-Control-Allow-Origin');
});

createApp(noCors).add(
    createRoute('OPTIONS', '/**', ({ res }) => {
        res.removeHeader('Access-Control-Allow-Headers');
        res.removeHeader('Access-Control-Allow-Methods');

        throw Ex.NotFound();
    })
);
```

# `HEAD` requests

By default if a `HEAD` request has no matching route our application will look for a `GET` route to use in it's place. Therefore it is important to keep in mind that `HEAD` requests follow the same flow as `GET` requests in our application.

```javascript
// HEAD

createRoute('GET', '/api/users', ({ req }) => {
    if (req.method === 'HEAD') {
        // this is a HEAD request
    }
});
```

In most cases `HEAD` and `GET` requests should run the same code, so we have nothing to worry about. Detection of `HEAD` requests is already handled by the renderers that are built-in to the framework. Largely what will happen is no body will be sent in the client, which is what they requested.

Occasionally we may need to differentiate between the two as it is generally understood that a `HEAD` request does not modify data. In this case looking at the value of `req.method` can be useful.

The following would remove default `HEAD` request functionality.

```javascript
// HEAD

createApp().add(
    createRoute('HEAD', '/**', () => {
        throw Ex.NotFound();
    })
);
```

# # inject()

```javascript
const { inject } = require('kequapp');
```

```
# inject(app: Kequapp, options: {}): { req, res, getResponse };
```

We may unit test our application without starting a server by using the `inject()` tool. The first parameter is our app, then options used to populate the request.

The returned `req` value is a simulations of node's built-in [`ClientRequest`](https://nodejs.org/api/http.html#class-httpclientrequest) object and can be written to. The returned `res` value os a simulation of node's built-in [`ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) object and can be read from.

The returned `getResponse()` tool waits for our application to finish, and then parses the response. We could inspect what our application is doing in realtime using the `req`, and `res` objects instead.

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

All requests are automatically finalized when using `inject()` unless the `body` parameter is set `null`. Doing this will allow us to write to the stream when more precise testing is required.

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
// body

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

Note that `getResponse()` will not resolve unless the request is finalized.

# Conclusion

That's it. This should be able to handle construction of complicated applications that does anything we could want. At least for version `0.2.*` I think it's okay.

Please feel free to contribute or create issue tickets on the github page. Tell me what needs improvement.
