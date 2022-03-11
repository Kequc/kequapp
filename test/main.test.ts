import 'kequtest';
import assert from 'assert';
import {
    createApp,
    createBranch,
    createErrorHandler,
    createRenderer,
    createRoute,
    autoHead,
    sendFile,
    staticFiles,
    Ex
} from '../src/main';

it('exports a lot of stuff', () => {
    assert.strictEqual(typeof createApp, 'function');
    assert.strictEqual(typeof createBranch, 'function');
    assert.strictEqual(typeof createErrorHandler, 'function');
    assert.strictEqual(typeof createRenderer, 'function');
    assert.strictEqual(typeof createRoute, 'function');
    assert.strictEqual(typeof autoHead, 'function');
    assert.strictEqual(typeof sendFile, 'function');
    assert.strictEqual(typeof staticFiles, 'function');
    assert.strictEqual(typeof Ex, 'object');
});

it('exposes a branch on the app', () => {
    assert.strictEqual(typeof createApp().add, 'function');
});
