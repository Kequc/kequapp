<img alt="kequapp" src="https://github.com/Kequc/kequapp/blob/main/logo.png?raw=true" width="370" height="95" />

# Kequapp

**A minimal, zero-magic Node web framework built on native APIs**

*\ \`hek-yü-ap \\*

[![npm version](https://img.shields.io/npm/v/kequapp?color=2e7dd7)](https://www.npmjs.com/package/kequapp)
[![Node Version](https://img.shields.io/node/v/kequapp?color=2e7dd7)](#installation)
[![License](https://img.shields.io/npm/l/kequapp?color=2e7dd7)](./LICENSE)

---
### Why Kequapp?

Kequapp emphasizes *clarity* and *explicit control* with a minimal surface area:

* **Zero Runtime Dependencies** – Uses only built‑in Node modules while still providing body parsing, cookies, and related helpers.
* **ESM‑Only, Modern Target** – Distributed as standard ES modules with TypeScript support.
* **Explicit Actions Pipeline** – Sequential functions; returning a value terminates execution and dispatches to the appropriate renderer.
* **Content‑Type–Driven Rendering and Errors** – The `Content-Type` header determines which renderer or error handler is chosen.
* **Correct CORS / OPTIONS Handling** – Automatically responds to `OPTIONS` with the exact allowed methods for the requested path; further customization via actions.
* **Minimal, Predictable API Surface** – Core factories: apps, branches, routes, actions, renderers, and error handlers with no hidden magic.

---
### Core Factories

| Factory | Description |
| -------------------- | -------------------- |
| `createApp` | Constructs the root `(req, res)` handler for direct use with `http.createServer()` (or any Node HTTP server). |
| `createBranch` | Composes an additional set of routes under a common context. |
| `createRoute` | Declares a HTTP route, method, URL pattern, and actions. |
| `createAction` | Defines a pipeline step (async function supported) with typed context; return a value to finalize, throw to signal error handling. |
| `createRenderer` | Registers a renderer for the given `Content-Type` when any action returns a value. |
| `createErrorHandler` | Registers an error handler for the provided `Content-Type` which is invoked when any action throws an error. |

---

### Installation

```bash
npm install kequapp
```

* **Node:** Current, modern Node is expected above 20.
* **Module system:** ESM only.

---

### Hello World!

```js
import { createServer } from 'node:http';
import { createApp } from 'kequapp';

const app = createApp({
  routes: [
    {
      method: 'GET',
      url: '/',
      actions: [() => 'Hello world!'],
    },
  ],
});

createServer(app).listen(4000, () => {
  console.log('Server running at http://localhost:4000');
});
```

Returning the string triggers a renderer selected by the current `Content-Type`. Because no header is set yet, the default resolves to `text/plain`.

To emit JSON instead, set the header *in the actions* before returning a value:

```js
import { createApp, createBranch, createAction } from 'kequapp';

const jsonAction = createAction(({ res }) => {
  res.setHeader('Content-Type', 'application/json');
});

const apiBranch = createBranch({
  url: '/api',
  actions: [jsonAction],
  routes: [
    {
      method: 'GET',
      url: '/',
      actions: [() => ({ message: 'Hello world!' })]
    }
  ]
});

const app = createApp({
  branches: [apiBranch]
});
```

The library comes with a renderer for `application/json` (as well as `text/*`) already built-in so this works without additional effort.

---

### Documentation

Extended guides and reference (renderers, error handling, content negotiation, advanced routing, body helpers, cookies):

**[https://kequapp.kequtech.com](https://kequapp.kequtech.com)**

---

### CORS & OPTIONS

Kequapp returns an accurate `OPTIONS` response for URLs where you define an `OPTIONS` route.

Add a single wildcard `OPTIONS` route at the root to cover your application, or per‑path routes if you need granular control. Customize CORS (e.g. `Access-Control-Allow-Origin`, `Access-Control-Max-Age`) by attaching actions to those `OPTIONS` routes.

---

### Upgrading

Breaking changes and migration notes are tracked in the **[changelog](./changelog.md)**.

---

### License

ISC © Nathan Lunde-Berry
