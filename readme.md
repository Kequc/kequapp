# Introduction

This is a request listener for use with Node's `createServer`.

When you use `createServer` in a node application it gives you a callback to make use of incoming requests and deliver server responses. This framework is a way to use all of the included features of `createServer` without overloading or changing any of it's behavior or functionality.

A means to make the task easier to do.

```
npm i kequapp
```

```javascript
const { createServer } = require('http');
const { createApp } = require('kequapp');

const app = createApp();

app.route(() => {
    return 'Hello world!';
});

createServer(app).listen(4000, () => {
    console.log('Server running at http://localhost:4000');
});
```

This route specified will respond to all `'GET'` requests made to the base of the application, at `'/'`. Otherwise your application will respond gracefully with `404` not found. We're on our way to making a app.

Routes specify a method (`'GET'`, `'POST'`, etc...) and url. Methods can be anything you want, doesn't have to be one of the well known ones. And the url is anything you want to act on with the given handlers.

Alternatively you can specify a branch of the application, which will cause all child routes to adopt the given url and handlers. Any route can have any number of handlers, handlers run in sequence, and terminate if one of them returns a value, throws an error, or finalizes the response.

# Route and Branch

```
type Handler = (bundle: Bundle) => unknown;

app.route(method?: string, url?: string, ...handlers: Handler[]);
Returns the `app`.

app.branch(url?: string, ...handlers: Handler[]);
Returns a new branch of the `app`.
```

The following example uses both `branch` and `route`.

```javascript
function json ({ res }) {
    res.setHeader('Content-Type', 'application/json');
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

There are several properties that are created for every request and passed through all handlers this is called the bundle.

### req

The node [`req`](https://nodejs.org/api/http.html#class-httpclientrequest) object. It is not modified by this framework so you can rely on the official documentation to use it.

This represents the client request.

### res

The node [`res`](https://nodejs.org/api/http.html#class-httpserverresponse) object. It is not modified by this framework either and you can rely on the official docs.

This represents your response.

### url

If you need to know more about what the client is looking at in the url bar you can do so with this. It is a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance generated from the `req` object.

Useful for examining a querystring for example by digging into it's [`searchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).

```javascript
app.route('/hotels', ({ url }) => {
    const page = url.searchParams.get('page');
    const categories = url.searchParams.getAll('categories');

    // page ~= '2'
    // categories ~= ['ac', 'hottub']
});
```

### context

A convenient place to store variables derived by handlers, you might use these variables elsewhere in the handler lifecycle. Make changes here whenever you want and populate it with anything.

Useful for storing authentication details for example, or any information that is needed amongst several handlers or routes.

### params

When defining a route you can specify parameters to extract by prefixing a `:` character in the url. If you specify a route such as `/user/:userId` you will have a parameter called `userId`, it is always a string.

### getBody

Node delivers the body of a request in chunks. It is not always necessary to wait for the request to finish before we begin processing it. Although in most cases we just want the data therefore a helper method `getBody()` is provided which you may use to await body parameters from the completed request.

```javascript
app.route('POST', '/user', async ({ getBody }) => {
    const body = await getBody();

    // body ~= {
    //     name: 'April'
    // }

    return `User creation ${body.name}!`;
});
```

This method can be used in many ways so we will look at it again in more detail in [another section.](#body)

### logger

During instantiation of our project in `createApp` it is possible to provide a `logger` which will be used throughout the application. This is that object.


# Configuration Options

During instantiation of the app there are several configuration options available.

### logger

As mentioned this is very simply a logger to use throughout the app. Debug messages are sent for every request, `500` errors are logged here. As well as anything else you want to use it for in your app. If not specfied the default is `console`.

### renderers

As you can see we are just returning a payload in the examples above and not actually rendering anything, or finalizing what's being sent to the client, or any of that. This is what renderers do.

When we `return` anything from a handler, a `renderer` is triggered which corresponds to the type of data we are sending.

In most cases you want to send text, or maybe an image, a file, or whatever. The renderer is chosen based on the `Content-Type` header that has been set. That is why in our original example it was possible to set the `Content-Type` to `application/json` and then simply return javascript objects from our handlers.

When the renderer is triggered, it will take whatever your payload is and use it to respond in any way you want. Abstracting rendering away from business logic is convenient but if you want you can skip rendering by finalizing the response yourself.

```javascript
function authenticated ({ req, res}) {
    // must be authenticated!

    if (!req.headers.authorization) {
        // trigger redirect
        res.statusCode = 302;
        res.setHeader('Location', '/login');

        // finalize response
        res.end();

        // will not use renderer
    }
}

app.route('/api/users', authenticated, ({ req, res }) => {
    res.setHeader('Content-Type', 'application/json');

    return {
        users: [{ name: 'April' }, { name: 'Leo' }]
    };

    // uses renderer
});
```

Renderers are built in for `text/plain` (which is also the default) and `application/json`, but these can be overridden or extended by providing `renderers` while creating your app.

These act as the final step of a lifecycle and should explicitly finalize the response.

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

If a response isn't finalized for any reason at the end of it's handler lifecycle an error will be thrown.

### errorHandler

This is responsible for making use of any exception and turning it into useful information that should be sent to the client, and acts much the same as any other handler. The default error handler will return a json formatted response that includes some useful information for debugging.

This example sends a very basic custom response.

```javascript
const app = createApp({
    errorHandler (error, { res }) {
        const statusCode = error.statusCode || 500;

        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'text/plain');

        return `${statusCode} ${error.message}`;
    }
});
```

Errors thrown inside of the error handler or within the renderer used to handle it will cause a fatal exception.

### autoHead

`HEAD` requests made by the client are handled in a special way.

If no matching `HEAD` route is found the matching `GET` route is triggered instead. It is the responsibility of your application usually in the renderer to detect a `HEAD` request and then pass no body.

This behavior can be disabled by setting `autoHead` to `false`.

# Utilities

There are a few helper utilities you can use while building your application which should make some processes easier.

### Ex

Any normal error will trigger a `500` internal server error response within the default error handler. There is a helper available that makes it possible to use any status code `400` and above.

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

These methods create errors with correct stacktraces and a valid status code would be sent to the client there is no need to use `new`.

### staticFiles

A rudimentary handler for delivering files relative to your project directory.

It utilizes the `**` parameter as defined by your route to build a valid path, and will try to guess a correct content type based on the file extension.

If no `dir` is specified then `/public` is used by default. Exclusions can be provided if you want to ignore some files or directories using `exclude`. If there are files included which have unusual file extensions more `mime` types can be provided.

```javascript
const { staticFiles } = require('kequapp');
```

```javascript
app.route('/assets/**', staticFiles({
    dir: '/my-assets-dir',
    exclude: ['/my-assets-dir/private'],
    mime: {
        '.3gp': 'audio/3gpp'
    }
}));
```

### sendFile

Will send a file to the client and finalize the response. A mime type can be provided as a third parameter otherwise it will guess.

```javascript
const { sendFile } = require('kequapp');
```

```javascript
app.route('/db.json', async function ({ req, res }) {
    const pathname = '/db/my-db.json';
    await sendFile(res, pathname);
});
```

# Body

The `getBody()` method mentioned earlier can be used to retrieve, parse, and normalize all sorts of data from client requests.

### multipart

Causes the function to return both `body` and `files`. If the client didn't send any files, or it wasn't a multipart request the second parameter will be an empty array.

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

### raw

The body is processed as minimally as possible and will return a single buffer as it arrived.

When combined with `multipart`, the body is parsed as an array with all parts split into separate buffers with respective headers.

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

### skipNormalize

By default the data received is pushed through some body normalization. This is so that the body you receive is in a format you expect and becomes easier to work with.

Disable body normalization with either `raw` or `skipNormalize`.

### arrays

The provided list of fields will be arrays.

Fields which are expected to be arrays must be specified. We only know a field is an array when we receive more than one item with the same name from the client, which creates ambiguity in our data. Therefore fields that do not specify they are an array will return the first value. Fields which specify they are an array but receive no data will be an empty array.

```javascript
app.route('POST', '/user', async ({ getBody }) => {
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

The provided list of fields are not `null` or `undefined`. It's a quick way to throw a `422` unprocessable entity error. These fields might still be empty, but at least something was sent and you can operate on it. When a `required` field is also an `arrays` field the array has at least one value.

### numbers

The provided list of fields will throw a `422` unprocessable entity error if any value is provided which parses into `NaN`. Otherwise they are converted into numbers. When a `numbers` field is also an `arrays` field the array is all numbers.

### booleans

The provided list of fields are converted into `false` if the value is falsy, `'0'`, or `'false'`, otherwise `true`. When a `booleans` field is also an `arrays` field the array is all booleans.

### validate

After all other normalization steps are performed, this method is run which further ensures that the data is valid. Returning anything within this method causes a `422` unprocessable entity error with the given text.

### postProcess

After all other normalization steps are performed and `validate` has passed, this method is run to further format the response in any way you need.

The returned value will be the final result.

```javascript
function validate (result) {
    if (result.ownedPets.length > 99) {
        return 'Too many pets';
    }
    if (result.ownedPets.length < 2) {
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

By default the max payload size is `1e6` (approximately 1mb), if this is exceeded the request will be terminated. If you are absolutely sure you want to receive a payload of any size then a value of `Infinity` is accepted.

# Cookies

It's easier to encode and decode cookies with an external library as there is no similar functionality built into the node ecosystem.

```javascript
const cookie = require('cookie'); // npm i cookie
```

```javascript
function withCookies ({ req, context }) {
    const cookies = cookie.parse(req.headers.cookie);
    // cookies ~= { myCookie: 'hello' }
    context.cookies = cookies;
}

const branchWithCookies = app.branch(withCookies);

app.route('/set-my-cookie', ({ res }) => {
    res.setHeader('Set-Cookie', cookie.serialize('myCookie', 'hello'));
    return 'ok';
});
```

# Unit Test

You may test your application without spinning up a server by using the `inject()` helper tool. The first parameter is your app, then options largely used to populate the request.

Returned `req` and `res` objects are from the npm [`mock-req`](https://www.npmjs.com/package/mock-req) and [`mock-res`](https://www.npmjs.com/package/mock-res) modules respectively. Ensure you have both installed in your dev dependencies.

It also returns `getResponse()` which may be used to wait for your application to respond. You may instead inspect what your application is doing in realtime using the `req`, and `res` objects.


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

### overrides

Overrides the configuration of your application.

### body

All requests are automatically finalized when using `inject()` unless you set `body` to `null`. Doing so will allow you to write to the stream.

The following two examples are the same.

```javascript
const { getResponse } = inject(app, {
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
const { getResponse, req } = inject(app, {
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

# Conclusion

And that's it. This should be ample for constructing an application that does anything you could ever want it to do. At least for version `0.1.0` I think it's okay.

Please feel free to contribute or create issue tickets on the github page. Tell me what is missing.
