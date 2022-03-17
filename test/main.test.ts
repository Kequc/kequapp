import 'kequtest';
import assert from 'assert';
import {
    createApp,
    createBranch,
    createErrorHandler,
    createRenderer,
    createRoute,
    allowOrigin,
    cors,
    sendFile,
    staticFiles,
    createHandle,
    extendHeader,
    setHeaders,
    Ex
} from '../src/main';

it('exports a lot of stuff', () => {
    assert.strictEqual(typeof createApp, 'function');
    assert.strictEqual(typeof createBranch, 'function');
    assert.strictEqual(typeof createErrorHandler, 'function');
    assert.strictEqual(typeof createRenderer, 'function');
    assert.strictEqual(typeof createRoute, 'function');
    assert.strictEqual(typeof allowOrigin, 'function');
    assert.strictEqual(typeof cors, 'function');
    assert.strictEqual(typeof sendFile, 'function');
    assert.strictEqual(typeof staticFiles, 'function');
    assert.strictEqual(typeof createHandle, 'function');
    assert.strictEqual(typeof extendHeader, 'function');
    assert.strictEqual(typeof setHeaders, 'function');
    assert.strictEqual(typeof Ex, 'object');
});

it('exposes a branch on the app', () => {
    const app = createApp();
    assert.strictEqual(typeof app.add, 'function');
    assert.strictEqual(app, app.add());
});
