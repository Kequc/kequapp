<img alt="kequapp" src="https://github.com/Kequc/kequapp/blob/main/logo.png?raw=true" width="142" height="85" />

Non-intrusive Node JavaScript web application framework

*\ `hek-yü-ap \\*

## Upgrading

0.7.0 -> 0.8.0

Handles are now called actions. Replace all instances of "handle" with "action", "createHandle" with "createAction".

## Introduction

Kequapp is a framework designed to leverage Node's built-in features while staying out of your way. It can be used to create performant api's, html pages, and anything you can think of. Kequapp provides a robust and flexible foundation to build your web applications with ease.

## Documentation

For detailed documentation, guides, and more examples, please visit the <a href="https://kequapp.kequtech.com" target="_blank">official documentation website</a>.

## Installation

```bash
npm install kequapp
```

## Hello World Example

Here's a simple example to get you started with Kequapp.

```javascript
import { createServer } from 'http';
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

## Contributing

Contributions welcome! If you have any questions, need further assistance, or want to contribute, please visit our <a href="https://github.com/Kequc/kequapp" target="_blank">GitHub page</a>.

## License

Kequapp is licensed under the ISC License.
