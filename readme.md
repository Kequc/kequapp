<img alt="kequapp" src="https://github.com/Kequc/kequapp/blob/0.2-wip/logo.png?raw=true" width="142" height="85" />

Versatile, non-intrusive webapp framework

*\ `hek-yü-ap \\*

# Introduction

This framework manages three stages of a request separately. First the route which is broken up into bite sized pieces, then handling errors if they come up, and finally rendering a response to the client. Each step is as non-obtrusive as possible, so that we can focus on creating applications using Node's built in features.

Intended to be simple to learn and use. While also being powerful and capable of doing it any way we need.

**Features**

* Modern modular framework
* CORS by default
* Body parsing for multipart requests
* Static file serving
* Async await everywhere
* Does not modify Node features or functionality
* Handle any request and return any response
* Unit testing tool
* No dependencies <3

```
npm i kequapp
```

# General

**handle**

A route is composed of one or more handles which run in sequence. Handles are responsible for all of the heavy lifting and contain most of our application code.

**route**

Each route is a self contained collection of handles, these direct the lifecycle of a request at a given url.

**branch**

Used for distributing behavior across multiple routes and helping to stay organized during development. We might separate a json api from client facing pages for example, and want different behaviors which are common to either area.

**error handler**

An appropriate error handler is invoked whenever a handle throws an exception. They behave much the same as a handle but should not throw an exception.

**renderer**

An appropriate renderer is invoked whenever a handle or error handler returns a value apart from `undefined`. These behave much the same as a handle but are always the last step of a request and should deliver a response to the client.

# Hello world!

```javascript
// hello world!

import { createServer } from 'http';
import { createApp, createRoute } from 'kequapp';

const app = createApp().add(
    createRoute(() => {
        return 'Hello world!';
    })
);

createServer(app).listen(4000, () => {
    console.log('Server running at http://localhost:4000');
});
```

This example responds to all `'GET'`, and `'HEAD'` requests made to the base of our application at `'/'`. Otherwise a `404` not found error will be thrown. The reason this responds to requests at `'/'` is that is the default url for new routes.

The defaults are the same as writing the following:

```javascript
createRoute('GET', '/', () => {
    return 'Hello world!';
});
```

The framework comes with a built-in error handler and some renderers. We will look at how to create our own, but for now we don't need to worry about it.

# # createHandle()

```javascript
import { createHandle } from 'kequapp';
```

```
# createHandle(handle: Handle): Handle;
```

This is useful for building handles that exist outside of any scope, for example in another file. This provides types if we are using TypeScript.

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

In these examples the `json` handle sets `'Content-Type'` to `'application/json'`, and the `loggedIn` handle checks for an `authorization` header from the client.

Handles can be asyncronous.

# Modules

The following modules [`createRoute()`](#-createroute), [`createBranch()`](#-createbranch), [`createErrorHandler()`](#-createerrorhandler), and [`createRouter()`](#-createrouter) are all added the same way to a branch or the base of the application.

All can be added in any order, they are rearranged and organized by the framework based on specificity.

```
'/icecream'
'/icecream/special_offers'
'/icecream/:flavor'
'/icecream/:flavor/toppings'
'/icecream/:flavor/**'
'/locations'
'/**'
```

The more specific the url the higher the priority.

# # createRoute()

```javascript
import { createRoute } from 'kequapp';
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

createRoute('POST', '/admin/users', loggedIn, () => {
    // do something here

    return `User created!`;
});
```

This example has two handles. One which we defined earlier called `loggedIn` and a second that returns a value that will be sent to the renderer.

# # createBranch()

```javascript
import { createBranch } from 'kequapp';
```

```
# createBranch(url: Pathname, ...handles: Handle[]): Branch;
# createBranch(...handles: Handle[]): Branch;
```

A branch of the application will cause routes to adopt the given url and handles.

Every branch of our application exposes `add()`. This is an important function used to extend the branch with functionality. Usually this will be a route, another branch, an error handler, or renderer.

```javascript
// createBranch

createBranch().add(
    createBranch('/api', json).add(
        createBranch('/users').add(
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

Routes beginning with `'/api'` are returning `'application/json'` formatted responses, we can see those routes are returning javascript objects.

Routes beginning with `'/admin'` require the user to be logged in. Three routes are defined in the example and therefore our endpoints are the following:

```
GET /api/users
GET /api/users/:id
GET /admin/dashboard
```

The example is verbose. We can omit the `'/api'` branch because it only exposes one branch, and the `'/admin'` branch because it only exposes one route, leaving us the same result with less code.

```javascript
// createBranch

createBranch().add(
    createBranch('/api/users', json).add(
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
import { createErrorHandler } from 'kequapp';
```

```
# createErrorHandler(contentType: string, url: Pathname, handle: Handle): ErrorHandler;
# createErrorHandler(url: Pathname, handle: Handle): ErrorHandler;
# createErrorHandler(contentType: string, handle: Handle): ErrorHandler;
# createErrorHandler(handle: Handle): ErrorHandler;
```

If no content type is provided the error handler will be used for all content types.

The url is used if you only want it to be used for specific routes. For example `/api/**` would mean it is only used for routes in that location. Usually this isn't needed because it is easier to add the error handler to that branch of the application instead.

Error handlers turn an exception into useful information that should be sent to the client. We may return a value to invoke a renderer or finalize the response directly inside the error handler. The default structures a json formatted response with helpful information for debugging.

The following is a very simple text error handler.

```javascript
// createErrorHandler

createErrorHandler('text/*', (ex, { res }) => {
    return `${ex.statusCode} ${ex.message}`;
});
```

Errors thrown within an error handler or the renderer it invokes will cause a fatal exception and an empty `body` will be delivered to the client.

Error handlers are sorted by the framework in favor of specificity.

For a good example of how to write error handlers see this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# # createRenderer()

```javascript
import { createRenderer } from 'kequapp';
```

```
# createRenderer(contentType: string, url: Pathname, handle: Handle): ErrorHandler;
# createRenderer(url: Pathname, handle: Handle): ErrorHandler;
# createRenderer(contentType: string, handle: Handle): ErrorHandler;
# createRenderer(handle: Handle): ErrorHandler;
```

If no content type is provided the renderer will be used for all content types. The url is used in the same way as it is in error handlers.

Renderers are responsible for finalizing the response to the client. It is the last stage of a request and otherwise an empty `body` will be delivered.

There are default renderers that come built-in for both `'text/*'` and `'application/json'`, however these can be overridden by defining our own.

The following is a simple example of what an html renderer might look like.

```javascript
// createRenderer

createRenderer('text/html', (payload, { res }) => {
    const html = myMarkupRenderer(payload);

    // finalize response
    res.end(html);
});
```

Renderers are sorted by the framework in favor of specificity.

For good examples of how to write renderers see this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# # createApp()

```javascript
import { createApp } from 'kequapp';
```

```
# createApp(config: Config, ...handles: Handle[]): Branch;
# createApp(...handles: Handle[]): Branch;
```

The creates a branch but it is also the base of our application. Any handles that are specified here will be used with all routes. It is meant to be passed as the event handler into Node's `createServer` method.

The config options available are very simple and only useful for changing some app wide configuration.

```javascript
// createApp

createApp({
    silent: true,
    autoHead: false
});
```

Setting `silent` to true disables all logging in the framework.

Disabling `autoHead` will mean that the framework doesn't automatically use `GET` routes for `HEAD` requests, as described in [more detail](#head-requests) later.

# Respond to a request

Handles may terminate a request at any time in one of three ways:

| | |
| ---- | ---- |
| **Return a value** | A renderer is invoked. |
| **Throw an error** | An error handler is invoked. |
| **Finalize the response** |

Finalizing a response is for cases where we need the most control. It allows us to terminate the response any way we want without invoking a renderer.

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

createRoute('/api/users', authenticated, json, () => {
    // returning a value invokes a renderer
    return {
        users: [{ name: 'April' }, { name: 'Leo' }]
    };
});
```

In this example if the client did not provide an `authorization` header, the `authenticated` handle will finalize the response. This terminates the request and skips all remaining handles. Otherwise the `json` handle sets `'Content-Type'` of the response to `'application/json'`.

The last remaining handle returns a value. This invokes a renderer best matching the `'Content-Type'` of the response, in this example a renderer matching `'application/json'` will be used. The renderer will finalize the response to the client.

# Bundle

Properties such as `req`, `res`, and `context` are found throughout the examples above. These properties are generated for every request and are available in every route, renderer, and error handler.

* **`req`**

Node's [`ClientRequest`](https://nodejs.org/api/http.html#class-httpclientrequest) object. It is not modified by this framework so we can rely on the official documentation to use it. This represents the client request.

* **`res`**

Node's [`ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) object. It is not modified by this framework so we can rely on the official documentation to use it. This represents the server response.

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

* **`methods`**

An array of methods available in our app at the current url.

* **`context`**

A place to store variables derived by handles, we might use these variables elsewhere in our code. Changes can be made here whenever we want and it may be populated with anything.

Maybe authentication details, a user object, or any data that's used in other places.

* **`params`**

When defining a route we can specify parameters to extract by prefixing a colon `'/:'` character in the url. If we specify a route such as `'/users/:userId'` we will have a parameter called `'userId'`. Use a double asterix `'/**'` to accept anything for the remainder of the url.

Param values are always a string.

* **`getBody()`**

This method can be used in many ways so the next section will look at it in detail.

# # getBody()

Node delivers the body of a request in chunks.

It is not necessary to wait for the request to finish before we begin processing it. In most cases we just want the data and therefore a helper method `getBody()` is provided which we may use to await body parameters from the completed request.

```javascript
// getBody

createRoute('POST', '/users', async ({ getBody }) => {
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

Fields that are not specified will return only the first value. This is because the framework only knows that a field is an array when it receives more than one value for a given name from the client. It would be inconvenient if parameters are sometimes arrays, and therefore we are explicit.

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

The provided list of fields are converted into `false` if the value is falsy, `'0'`, or `'false'`, otherwise `true`. When a `booleans` field is also an `arrays` field the array is all booleans. When a `booleans` field is also a `numbers` field the value is first converted to a number and then to a boolean this is not recommended.

* **`validate`**

After normalization, this method further ensures the validity of the data. Returning anything from this function throws a `422` unprocessable entity error.

```javascript
// validate

type TBody = {
    ownedPets: string[];
    age?: number;
};

createRoute('POST', '/users', async ({ getBody }) => {
    const body = await getBody<TBody>({
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

type TBody = {
    ownedPets: string[];
    age: number;
    name: string;
};

createRoute('POST', '/users', async ({ getBody }) => {
    const body = await getBody<TBody>({
        arrays: ['ownedPets'],
        required: ['age', 'name'],
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

# CORS and `OPTIONS` requests

CORS behavior is managed by headers as shaped by handles. The framework will automatically add default headers we can use for basic support.

To enable CORS our application needs to respond to preflight requests, therefore we define an `OPTIONS` route. By default any url that has a matching `OPTIONS` route is decorated with `'Access-Control-Allow-Origin'` with value of `'*'`. This alone is enough to handle the majority of CORS related cases and functionality.

```javascript
// CORS

createApp().add(
    createRoute('OPTIONS', '/**')
);
```

The framework automatically attaches four additional headers to `OPTIONS` responses.

`'Valid'` and `'Access-Control-Allow-Methods'` will correctly identify all methods available at the requested url. `'Access-Control-Allow-Headers'` will return headers that the client specified. `'Content-Length'` will be 0.

In addition the default response code for `OPTIONS` requests is `204`. To change any of this behavior or add more headers to `OPTIONS` responses we use a handle.

```javascript
// CORS

createApp().add(
    createRoute('OPTIONS', '/**', ({ res }) => {
        res.setHeader('Access-Control-Max-Age', 86400);
        res.setHeader('Vary', 'Access-Control-Request-Headers');
    })
);
```

As `OPTIONS` responses do not need to include a body, we can safely leave the route like this without rendering.

The simplest place to override `'Access-Control-Allow-Origin'` is at the base of the application, but we may adjust this as needed. The `createApp` method accepts handles and is a convenient place to set global headers.

```javascript
// CORS

const strictCors = createHandle(({ res, methods }) => {
    if (methods.includes('OPTIONS')) {
        res.setHeader('Access-Control-Allow-Origin', 'https://foo.com');
    }
});

createApp(strictCors);
```

This would cause all responses to include `'Access-Control-Allow-Origin'` but only if there is an `OPTIONS` route, one should be included for the mechanism to work correctly.

Please see the [MDN documentation on CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) for more information about headers that the browser expects to see.

# `HEAD` requests

By default if a `HEAD` request has no matching route our application will use a matching `GET` route in it's place. Therefore it is important to keep in mind that `HEAD` requests follow the same flow as `GET` requests in our application.

```javascript
// HEAD

createRoute('GET', '/api/users', ({ req }) => {
    if (req.method === 'HEAD') {
        // head request
    }
});
```

In most cases `HEAD` and `GET` requests should run the same code, so we have nothing to worry about. Detection of `HEAD` requests is already handled by the renderers that are built-in to the framework. Largely what will happen is no body will be sent to the client, which is what a `HEAD` request wanted.

Occasionally we may need to differentiate between the two as it is generally understood that a `HEAD` request does not modify data. In this case looking at the value of `req.method` can be useful.

# Helpers

The following helper tools [`sendFile()`](#-sendfile), and [`staticFiles()`](#-staticfiles) are included to make development of common features easier.

# # sendFile()

```javascript
import { sendFile } from 'kequapp';
```

```
# sendFile(res: Res, asset: string, mime: string): void;
# sendFile(res: Res, asset: string): void;
```

Send a file and finalize the response.

This is asyncronous and must be awaited otherwise the application might get confused as it continues processing the request. If a mime type is not provided a `'Content-Type'` header is guessed from the file extension.

```javascript
// sendFile

createRoute('/db.json', async ({ res }) => {
    await sendFile(res, '/db/my-db.json');
});
```

# # staticFiles()

```javascript
import { staticFiles } from 'kequapp';
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

app.add(
    staticFiles('/assets', {
        dir: '/my-assets-dir',
        exclude: ['/my-assets-dir/private'],
        mime: {
            '.3gp': 'audio/3gpp'
        }
    })
);
```

If no `dir` is specified then `'/public'` is used by default. Exclusions can be provided if we want to ignore some files or directories using `exclude`.

A `'Content-Type'` header is guessed based on the file extension. If there are files in the directory with unusual file extensions then additional `mime` types can be added.

# Utilities

The following utilities [`Ex()`](#-ex), and [`inject()`](#-inject) are used throughout your application. They are almost essential for building a well working app.


# # Ex.()

```javascript
import { Ex } from 'kequapp';
```

```
# Ex.<NAME>(message: string, ...info: unknown[]): new Error;
# Ex.<NAME>(message: string): new Error;
# Ex.<NAME>(): new Error;

# Ex.StatusCode(statusCode: number, message: string, ...info: unknown[]): new Error;
# Ex.StatusCode(statusCode: number, message: string): new Error;
# Ex.StatusCode(statusCode: number): new Error;
```

An unhandled exception from our application results in a `500` internal server error. If we would like an error with a different status code there is a helper tool.

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

This makes it easy to utilize any status code `400` and above. These methods create errors with correct stacktraces there is no reason to use `new`.

# # inject()

```javascript
import { inject } from 'kequapp';
```

```
# inject(app: Kequapp, options: {}): { req, res, getResponse };
```

We may unit test our application without starting a server by using the `inject()` tool. The first parameter is our app, then options used to populate the request.

The returned `req` value is a simulation of Node's built-in [`ClientRequest`](https://nodejs.org/api/http.html#class-httpclientrequest) object and is a `Transform` stream. The returned `res` value is a simulation of Node's built-in [`ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) object and is also a `Transform` stream.

The returned `getResponse()` tool waits for our application to finish, and then parses the response. We could inspect what our application is doing using the `req` and `res` objects in realtime instead if that's what we wanted to do.

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

All requests are automatically finalized when using `inject()` unless the `body` parameter is set `null`. Doing this will allow us to write to the stream in cases where more precise testing is necessary.

The following two examples are the same.

```javascript
// inject

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
// inject

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

Note that `getResponse()` will not resolve until the request is finalized.

# Conclusion

This should be able to handle construction of complicated applications that does anything we could want. Please feel free to contribute or create issue tickets on the github page.
