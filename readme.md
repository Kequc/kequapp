<img alt="kequapp" src="https://github.com/Kequc/kequapp/blob/0.2-wip/logo.png?raw=true" width="142" height="85" />

Non-intrusive Node JavaScript web app framework

*\ `hek-yü-ap \\*

# Introduction

Does the best it can to stay out of the way and leverage Node's built in features. It comes with a great deal of conveniences which makes it easy to structure an application. With regard to modularity, body parsing, testing, handling any request, and returning any response.

Intended to be simple,  powerful, and allows us to interceed at any time.

**Features**

* Modern modular framework
* CORS
* Body parsing for multipart requests
* Static file serving
* Async await everywhere
* Unit testing tool
* Exposes Node features and functionality
* No dependencies <3

# Install

```
npm i kequapp
```

# Hello world!

```javascript
// hello world!

import { createServer } from 'http';
import { createApp } from 'kequapp';

const app = createApp({
    routes: [
        {
            method: 'GET',
            url: '/',
            handles: [() => 'Hello world!']
        }
    ]
});

createServer(app).listen(4000, () => {
    console.log('Server running at http://localhost:4000');
});
```

This example responds to all `'GET'`, and `'HEAD'` requests made to `'/'` otherwise a `404 Not Found` error will be thrown. The framework comes with a built-in error handler and some renderers. We will look at how to create our own, but for now we don't need to worry about it.

# # createApp()

```javascript
import { createApp } from 'kequapp';
```

This prepares our application for use as the event handler in Node's `createServer()` method. It is otherwise identical to the `createBranch()` method.

All methods [`createBranch()`](#-createbranch), [`createRoute()`](#-createroute), [`createHandle()`](#-createhandle), [`createErrorHandler()`](#-createerrorhandler), [`createRenderer()`](#-createrenderer) described below are useful for building elements that exist outside of scope. For example in another file. This provides types if we are using TypeScript.

# # createBranch()

```javascript
import { createBranch } from 'kequapp';
```

| key | description | default |
| ---- | ---- | ---- |
| **url** | *Pathname* | `'/'` |
| **handles** | *Sequence* | `[]` |
| **logger** | *Logger* | `console` |
| **autoHead** | *HEAD request* | `true` |
| **routes** | *Routes* | `[]` |
| **branches** | *Branches* | `[]` |
| **errorHandlers** | *Error handlers* | `[]` |
| **renderers** | *Renderers* | `[]` |

A branch of the application will distribute the given options, handles, error handlers, and renderers through a section of branches and routes.

```javascript
// createBranch

createBranch({
    branches: [
        {
            url: '/api/users',
            handles: [json],
            routes: [
                {
                    method: 'GET',
                    url: '/',
                    handles: [() => ({ result: [] })]
                },
                {
                    method: 'GET',
                    url: '/:id',
                    handles: [({ params }) => ({ userId: params.id })]
                }
            ]
        }
    ],
    routes: [
        {
            method: 'GET',
            url: '/admin/dashboard',
            handles: [loggedIn, ({ context }) => `Hello admin ${context.auth}`]
        }
    ]
});
```

Three routes are defined in the example and therefore our endpoints are the following:

```
GET /api/users
GET /api/users/:id
GET /admin/dashboard
```

We can define an `'/api'` branch and an `'/admin'` branch, giving us the same result in a more verbose way.

```javascript
// createBranch

createBranch({
    branches: [
        {
            url: '/api',
            handles: [json],
            branches: [
                {
                    url: '/users',
                    routes: [
                        {
                            method: 'GET',
                            url: '/',
                            handles: [() => ({ result: [] })]
                        },
                        {
                            method: 'GET',
                            url: '/:id',
                            handles: [({ params }) => ({ userId: params.id })]
                        }
                    ]
                }
            ]
        },
        {
            url: '/admin',
            handles: [loggedIn],
            routes: [
                {
                    method: 'GET',
                    url: '/dashboard',
                    handles: [({ context }) => `Hello admin ${context.auth}`]
                }
            ]
        }
    ]
});
```

All routes and branches can be added in any order, they are rearranged and organized by the framework based on specificity.

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

| key | description | default |
| ---- | ---- | ---- |
| **method \*** | *Method* | |
| **url \*** | *Pathname* | |
| **handles** | *Sequence* | `[]` |
| **logger** | *Logger* | `console` |
| **autoHead** | *HEAD request* | `true` |

A route must specify a `method` (`'GET'`, `'POST'`, etc.) and a `url`. The `url` is a pathname that the route should respond to and must always start with `'/'`.

```javascript
// createRoute

createRoute({
    method: 'POST',
    url: '/admin/users',
    handles: [loggedIn, () => 'User created!']
});
```

This example has two handles. One called `loggedIn()`, then a second that returns a value which is therefore delivered to a renderer.

# # createHandle()

```javascript
import { createHandle } from 'kequapp';
```

A simple wrapper for a handle the purpose of which is to provide types.

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

In these examples the `json()` handle sets the `'Content-Type'` header to `'application/json'`, and the `loggedIn()` handle checks for an `'authorization'` header from the client. Handles can be asyncronous and always run in sequence.

# # createErrorHandler()

```javascript
import { createErrorHandler } from 'kequapp';
```

| key | description | default |
| ---- | ---- | ---- |
| **contentType \*** | *Content type* | |
| **handle \*** | *Handler* | |

An appropriate error handler is invoked whenever a handle throws an exception.

Error handlers turn an exception into useful information that should be sent to the client. We may return a value to invoke a renderer or finalize the response ourselves directly. The default built-in error handler structures a json formatted response with helpful information for debugging.

The `'Content-Type'` header set by our application determines the correct error handler to use. Error handlers are sorted by the framework in favor of content type and hierarchical specificity. The following is a very simple error handler for text based responses.

```javascript
// createErrorHandler

createErrorHandler({
    contentType: 'text/*',
    handler: (ex, { res }) => `${ex.statusCode} ${ex.message}`
});
```

Errors thrown within an error handler or the renderer it invokes will cause a fatal exception and an empty `body` will be delivered to the client.

For a good example of how to write an error handler see this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# # createRenderer()

```javascript
import { createRenderer } from 'kequapp';
```

| key | description | default |
| ---- | ---- | ---- |
| **contentType \*** | *Content type* | |
| **handle \*** | *Handler* | |

An appropriate renderer is invoked whenever a handle returns a value apart from `undefined`.

Renderers are responsible for finalizing the response to the client. It is the last stage of a request and without one an empty `body` will be delivered. There are default renderers that come built-in for both `'text/*'` and `'application/json'`, however these can be overridden by defining our own.

The `'Content-Type'` header set by our application determines the correct renderer to use. Error handlers are sorted by the framework in favor of content type and hierarchical specificity. The following is a simple example of what an html renderer might look like.

```javascript
// createRenderer

createRenderer({
    contentType: 'text/html',
    handle: (payload, { res }) => {
        const html = myMarkupRenderer(payload);

        // finalize response
        res.end(html);
    }
});
```

For good examples of how to write a renderer see this repo's [`/src/built-in`](https://github.com/Kequc/kequapp/tree/main/src/built-in) directory.

# How to respond to a request

Any handle may terminate a request one of three ways:

1. **Throw an error** - An error handler is invoked.
2. **Return a value** - A renderer is invoked.
3. **Finalize the response**

Finalizing a response is for cases where we need the most control. It allows us to terminate the response any way we want without invoking a renderer.

```javascript
// Respond to a request

const authenticated = createHandle(({ req, res }) => {
    // must be authenticated!

    if (!req.headers.authorization) {
        // cause redirect
        res.statusCode = 302;
        res.setHeader('Location', '/login');

        // finalize response to ignore remaining handles
        res.end();
    }
});

createRoute({
    method: 'GET',
    url: '/api/users',
    handles: [authenticated, json, () => {
        // return a value to invoke a renderer
        return {
            users: [{ name: 'April' }, { name: 'Leo' }]
        };
    }]
});
```

In this example if the client did not provide an `'authorization'` header, the `authenticated()` handle will finalize the response. This terminates the request and skips all remaining handles. Otherwise the `json()` handle sets the `'Content-Type'` header of the response to `'application/json'`.

The last remaining handle returns a value. This invokes a renderer best matching the `'Content-Type'` header, in this example a renderer matching `'application/json'` will be used. The appropriate renderer will finalize a response to the client.

# Bundle properties

Properties such as `req`, `res`, and `context` are found throughout the examples above. These properties are generated for every request and available in every route, renderer, and error handler.

#### **`req`**

Node's [`ClientRequest`](https://nodejs.org/api/http.html#class-httpclientrequest) object. It is not modified by this framework so we can rely on the official documentation to use it. This represents the client request.

#### **`res`**

Node's [`ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) object. It is not modified by this framework so we can rely on the official documentation to use it. This represents the server response.

#### **`url`**

If we need to know more about what the client is looking at in the url bar we can do so here. It is a [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance generated from the `req` object.

Useful for examining the querystring for example by digging into [`searchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).

```javascript
createRoute({
    method: 'GET',
    url: '/hotels',
    handles: [({ url }) => {
        const page = url.searchParams.get('page');
        const categories = url.searchParams.getAll('categories');

        // page ~= '2'
        // categories ~= ['ac', 'hottub']
    }]
});
```

#### **`methods`**

An array of methods available in our app at the current url.

#### **`context`**

A place to store variables derived by handles, we might use these variables elsewhere in our code. Changes can be made here whenever we want and it may be populated with anything.

Maybe authentication details, a user object, or any data that's used in other places.

#### **`params`**

When defining a route we can specify parameters to extract by prefixing a colon `':'` character in the url. If we specify a route such as `'/users/:userId'` we will have a `params` item called `'userId'`. Use a double asterix `'/**'` to accept anything for the remainder of the url, we will have a `params` item called `'wild'`.

Param values are always a string.

#### **`logger`**

The logger being used by the application.

#### **`getBody`**

This method can be used in many ways so the next section will look at it in detail.

# # getBody()

Node delivers the body of a request in chunks.

It is not necessary to wait for the request to finish before we begin processing it. In most cases we just want the data and therefore a helper method `getBody()` is provided which we may use to await body parameters from the completed request.

```javascript
// getBody

createRoute({
    method: 'POST',
    url: '/users',
    handles: [async ({ getBody }) => {
        const body = await getBody();

        // body ~= {
        //     name: 'April'
        // }

        return `User creation ${body.name}!`;
    }]
});
```

It takes an options object which can be used to parse and normalize a client request into useful data a large assortment of different ways.

#### **`multipart`**

Causes the method to return both `body` and `files`. If the client didn't send any files, or it wasn't a multipart request the second parameter will be an empty array.

```javascript
// multipart

createRoute({
    method: 'POST',
    url: '/users',
    handles: [async ({ getBody }) => {
        const [body, files] = await getBody({ multipart: true });

        // body ~= {
        //     name: 'April'
        // }
        // files ~= [{
        //     headers: {
        //         'content-disposition': 'form-data; name="avatar" filename="my-cat.png"',
        //         'content-type': 'image/png;'
        //     },
        //     contentType: 'image/png',
        //     name: 'avatar',
        //     filename: 'my-cat.png',
        //     data: Buffer <...>
        // }]

        return `User creation ${body.name}!`;
    }]
});
```

#### **`raw`**

Causes the body to be processed as minimally as possible and return a single buffer. When combined with `multipart`, the body is parsed into an array of separate buffers with their respective headers.

```javascript
// raw

createRoute({
    method: 'POST',
    url: '/users',
    handles: [async ({ getBody }) => {
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
    }]
});
```

#### **`skipNormalize`**

By default the data received is pushed through some body normalization. This is so that the body we receive is in a format we expect and is therefore easier to work with.

Disable body normalization with either `raw` or `skipNormalize`.

#### **`arrays`**

The provided list of fields are converted into arrays.

Fields that are not specified will return only the first value. This is because the framework only knows that a field is an array when it receives more than one value for a given name from the client. It would be inconvenient if parameters are sometimes arrays, and therefore we are explicit.

```javascript
// arrays

createRoute({
    method: 'POST',
    url: '/users',
    handles: [async ({ getBody }) => {
        const body = await getBody({
            arrays: ['ownedPets']
        });

        // body ~= {
        //     ownedPets: ['cat'],
        //     age: '23',
        //     name: 'April'
        // }
    }]
});
```

#### **`required`**

The provided list of fields are not `null` or `undefined`. It's a quick way to throw a `422 Unprocessable Entity` error. These fields might still be empty, but at least something was sent and we know we can operate on them. When a `required` field is also an `arrays` field the array is sure to have at least one value.

#### **`numbers`**

The provided list of fields will throw a `422 Unprocessable Entity` error if any value is provided which parses into `NaN`. Otherwise they are converted into numbers.

When a `numbers` field is also an `arrays` field the array is all numbers.

#### **`booleans`**

The provided list of fields are converted into `false` if the value is falsy, `'0'`, or `'false'`, otherwise `true`. When a `booleans` field is also an `arrays` field the array is all booleans. When a `booleans` field is also a `numbers` field the value is first converted to a number and then to a boolean this is not recommended.

#### **`validate`**

After normalization, this method further ensures the validity of the data. Returning anything throws a `422 Unprocessable Entity` error.

```javascript
// validate

type TBody = {
    ownedPets: string[];
    age: number;
    name: string;
};

createRoute({
    method: 'POST',
    url: '/users',
    handles: [async ({ getBody }) => {
        const body = await getBody<TBody>({
            arrays: ['ownedPets'],
            required: ['age', 'name']
            numbers: ['age'],
            validate (result) {
                if (result.ownedPets.length > 99) {
                    return 'Too many pets';
                }
                if (result.name.length < 3) {
                    return 'Name is too short';
                }
            }
        });

        // body ~= {
        //     ownedPets: ['Maggie', 'Ralph'],
        //     age: 23,
        //     name: 'April'
        // }
    }]
});
```

We know it is safe to use `result.ownedPets.length` in this example because it is listed as an `arrays` field and therefore certain to be an array. `result.name` is also safe to use because it is listed as a `required` field and therefore certain to exist.

#### **`maxPayloadSize`**

The max payload size is `1e6` (approximately 1mb) by default. If this payload size is exceeded by the client the request will be terminated saving our application both memory and bandwidth. If we are absolutely sure we want to receive a payload of any size then a value of `Infinity` is accepted.

# Logger

One of the options provided to `createBranch()` is a `logger` parameter. The default logger for the application is a simple object with methods for `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`, and `log`. Each mapping roughly to console.

Overriding this logger requires an object with some or all of the same methods.

# CORS and OPTIONS requests

CORS behavior is managed by headers as shaped by handles. The framework will automatically add default headers we can use for basic support.

To enable CORS our application needs to respond to preflight requests, therefore we define an `OPTIONS` route. By default any url that has a matching `OPTIONS` route is decorated with `'Access-Control-Allow-Origin'` with value of `'*'`. This alone is enough to handle the majority of CORS related cases and functionality.

```javascript
// CORS

createApp({
    routes: [
        {
            method: 'OPTIONS',
            url: '/**'
        }
    ]
});
```

The framework automatically attaches four additional headers to `OPTIONS` responses. `'Valid'` and `'Access-Control-Allow-Methods'` will correctly identify all methods available at the requested url. `'Access-Control-Allow-Headers'` will return headers that the client specified. `'Content-Length'` will be 0.

In addition the default response code for `OPTIONS` requests is `204`. To change any of this behavior or add more headers to `OPTIONS` responses we use a handle.

```javascript
// CORS

createApp({
    routes: [
        {
            method: 'OPTIONS',
            url: '/**',
            handles: [({ res }) => {
                res.setHeader('Access-Control-Max-Age', 86400);
                res.setHeader('Vary', 'Access-Control-Request-Headers');
            }]
        }
    ]
});
```

As `OPTIONS` responses do not need to include a body, we can safely leave the route like this without rendering.

The simplest place to override `'Access-Control-Allow-Origin'` is at the base of the application but we may adjust this as needed. The `createApp()` method accepts handles and is a convenient place to set global headers.

```javascript
// CORS

const strictCors = createHandle(({ res, methods }) => {
    if (methods.includes('OPTIONS')) {
        res.setHeader('Access-Control-Allow-Origin', 'https://foo.com');
    }
});

createApp({
    handles: [strictCors]
});
```

This would cause all responses to include `'Access-Control-Allow-Origin'` but only if there is an `OPTIONS` route, one should be included for the mechanism to work correctly.

Please see the [MDN documentation on CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) for more information about headers that the client expects to see.

# HEAD requests

By default if a `HEAD` request has no matching route our application will use a matching `GET` route in it's place. Therefore it is important to keep in mind that `HEAD` requests follow the same flow as `GET` requests in our application.

Occasionally we may need to differentiate between the two as it is generally understood that a `HEAD` request does not modify data. In this case looking at the value of `req.method` can be useful.

```javascript
// HEAD

createRoute({
    method: 'GET',
    url: '/api/users',
    handles: [({ req }) => {
        if (req.method === 'HEAD') {
            // head request
        }
    }]
});
```

In most cases `HEAD` and `GET` requests should run the same code, so we have nothing to worry about. Detection of `HEAD` requests is already handled by the renderers that are built-in to the framework. Largely what will happen is no body will be sent to the client, which is what a `HEAD` request wanted.

# # staticDirectory()

```javascript
import { staticDirectory } from 'kequapp';
```

| key | description | default |
| ---- | ---- | ---- |
| **url** | *Pathname* | `'/**'` |
| **dir** | *Local* | `'/public'` |
| **exclude** | *Exclusions* | `[]` |
| **contentTypes** | *Additions* | `{}` |
| **handles** | *Sequence* | `[]` |

Pairs a `url` with a static directory.

```javascript
// staticDirectory

createApp({
    routes: [
        staticDirectory({
            url: '/assets/**',
            dir: '/my-assets-dir',
            exclude: ['/my-assets-dir/private'],
            contentTypes: {
                '.3gp': 'audio/3gpp'
            }
        })
    ]
);
```

The `url` must end with `'/**'` capturing all possible paths.

Exclusions can be provided if we want to ignore some files or directories using `exclude`. A `'Content-Type'` header is guessed based on every asset's file extension. If there are assets in the directory with unusual file extensions then additional `contentTypes` may be provided.

# # staticFile()

```javascript
import { staticFile } from 'kequapp';
```

| key | description | default |
| ---- | ---- | ---- |
| **asset \*** | *Local* | |
| **url** | *Pathname* | `'/'` |
| **contentType** | *Content type* | |
| **handles** | *Sequence* | `[]` |

Pairs a `url` and a local file. This asset will be delivered to the client.

```javascript
// staticFile

createApp({
    routes: [
        staticFile({
            url: '/db.json',
            asset: '/db/my-db.json'
        })
    ]
);
```

If `contentType` is not provided a `'Content-Type'` header will be guessed from the file extension.

# # sendFile()

```javascript
import { sendFile } from 'kequapp';
```

Sends a file and finalizes the response.

This is asyncronous and must be awaited otherwise the application might get confused as it continues processing the request unexpectedly.

The following is the same as the `staticFile()` example above.

```javascript
// sendFile

createApp({
    routes: [
        {
            method: 'GET',
            url: '/db.json'
            handles: [async ({ req, res }) => {
                await sendFile(req, res, '/db/my-db.json');
            }],
        }
    ]
);
```

A fourth parameter may be provided defining a `'Content-Type'`, this header is otherwise guessed from the file extension.

# # Ex()

```javascript
import { Ex } from 'kequapp';
```

An unhandled exception from our application results in a `500 Internal Server Error`. If we would like an error with a different status code there is a helper tool for that.

```javascript
// Ex

createRoute({
    method: 'GET',
    url: '/throw-error',
    handles: [() => {
        throw Ex.NotFound();
        throw Ex.NotFound('Custom message', { extra: 'info' });
        // same as
        throw Ex.StatusCode(404);
        throw Ex.StatusCode(404, 'Custom message', { extra: 'info' });
    }]
});
```

This makes it easy to utilize any status code `400` and above. These methods create errors with correct stacktraces we can throw directly without the use of `new`.

# # inject()

```javascript
import { inject } from 'kequapp';
```

We may unit test our application without starting a server by using the `inject()` tool. The first parameter is our app, then options used to populate the request.

The returned `req` value is a simulation of Node's built-in [`ClientRequest`](https://nodejs.org/api/http.html#class-httpclientrequest) object and is a `Transform` stream. The returned `res` value is a simulation of Node's built-in [`ServerResponse`](https://nodejs.org/api/http.html#class-httpserverresponse) object and is also a `Transform` stream. The returned `getResponse()` tool waits for our application to finish, and then parses the response. It is very similar to `getBody()` as described earlier. We could inspect what our application is doing using the `req` and `res` objects in realtime instead if that's what we want.

```javascript
// inject

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
