import assert from 'node:assert/strict';
import { it } from 'node:test';
import {
    createApp,
    createBranch,
    createRoute,
    createAction,
    createErrorHandler,
    createRenderer,
    Ex,
    unknownToEx,
    inject,
    FakeReq,
    FakeRes,
    sendFile,
    staticDirectory,
} from '../src/index.ts';

it('exports a lot of stuff', () => {
    assert.equal(typeof createApp, 'function');
    assert.equal(typeof createBranch, 'function');
    assert.equal(typeof createRoute, 'function');
    assert.equal(typeof createAction, 'function');
    assert.equal(typeof createErrorHandler, 'function');
    assert.equal(typeof createRenderer, 'function');
    assert.equal(typeof Ex, 'object');
    assert.equal(typeof unknownToEx, 'function');
    assert.equal(typeof inject, 'function');
    assert.equal(typeof FakeReq, 'function');
    assert.equal(typeof FakeRes, 'function');
    assert.equal(typeof sendFile, 'function');
    assert.equal(typeof staticDirectory, 'function');
});
