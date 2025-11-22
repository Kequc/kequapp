import assert from 'node:assert/strict';
import { it } from 'node:test';
import {
    createAction,
    createApp,
    createBranch,
    createErrorHandler,
    createRenderer,
    createRoute,
    Ex,
    sendFile,
    staticDirectory,
} from '../src/index.ts';

it('exports a lot of stuff', () => {
    assert.equal(typeof createApp, 'function');
    assert.equal(typeof createBranch, 'function');
    assert.equal(typeof createErrorHandler, 'function');
    assert.equal(typeof createRenderer, 'function');
    assert.equal(typeof createRoute, 'function');
    assert.equal(typeof sendFile, 'function');
    assert.equal(typeof staticDirectory, 'function');
    assert.equal(typeof createAction, 'function');
    assert.equal(typeof Ex, 'object');
});
