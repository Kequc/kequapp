import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createAction,
    createBranch,
    createErrorHandler,
    createRenderer,
    createRoute,
} from '../../src/router/modules.ts';

describe('createAction', () => {
    it('creates a action', () => {
        const action = () => {};
        const result = createAction(action);

        assert.deepEqual(result, action);
    });
});

describe('createRoute', () => {
    it('creates a route', () => {
        const route = {
            method: 'POST',
            actions: [() => {}],
        };
        const result = createRoute(route);

        assert.deepEqual(result, route);
    });
});

describe('createBranch', () => {
    it('creates a branch', () => {
        const branch = {
            actions: [() => {}],
        };
        const result = createBranch(branch);

        assert.deepEqual(result, branch);
    });
});

describe('createErrorHandler', () => {
    it('creates a error handler', () => {
        const errorHandler = {
            contentType: 'application/json',
            action: () => {},
        };
        const result = createErrorHandler(errorHandler);

        assert.deepEqual(result, errorHandler);
    });
});

describe('createRenderer', () => {
    it('creates a renderer', () => {
        const renderer = {
            contentType: 'application/json',
            action: () => {},
        };
        const result = createRenderer(renderer);

        assert.deepEqual(result, renderer);
    });
});
