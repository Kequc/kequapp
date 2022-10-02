import assert from 'assert';
import 'kequtest';
import {
    createApp,
    createBranch,
    createErrorHandler,
    createHandle,
    createRenderer,
    createRoute,
    Ex,
    sendFile,
    staticFiles
} from '../src/main';

it('exports a lot of stuff', () => {
    assert.strictEqual(typeof createApp, 'function');
    assert.strictEqual(typeof createBranch, 'function');
    assert.strictEqual(typeof createErrorHandler, 'function');
    assert.strictEqual(typeof createRenderer, 'function');
    assert.strictEqual(typeof createRoute, 'function');
    assert.strictEqual(typeof sendFile, 'function');
    assert.strictEqual(typeof staticFiles, 'function');
    assert.strictEqual(typeof createHandle, 'function');
    assert.strictEqual(typeof Ex, 'object');
});

it('exposes a branch on the app', () => {
    const app = createApp();
    assert.strictEqual(typeof app.add, 'function');
    assert.strictEqual(app, app.add());
});

it('accepts handlers', () => {
    createApp(() => {}, () => {});
});

it('throws error on invalid handlers', () => {
    assert.throws(() => createApp(() => {}, 'foo'), {
        message: 'Handle item must be a function'
    });
});

it('accepts configuration options and handlers', () => {
    createApp({ silent: true, autoHead: false }, () => {}, () => {});
});

it('throws error on invalid configuration options', () => {
    assert.throws(() => createApp({ silent: 1, autoHead: 'foo' }), {
        message: 'Config silent must be a boolean'
    });
});
