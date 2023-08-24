import assert from 'assert';
import 'kequtest';
import {
    createBranch,
    createErrorHandler,
    createHandle,
    createRenderer,
    createRoute
} from '../../src/router/modules';

describe('createHandle', () => {
    it('creates a handle', () => {
        const handle = () => {};
        const result = createHandle(handle);

        assert.deepStrictEqual(result, handle);
    });
});

describe('createRoute', () => {
    it('creates a route', () => {
        const route = {
            method: 'POST',
            handles: [() => {}]
        };
        const result = createRoute(route);

        assert.deepStrictEqual(result, route);
    });
});

describe('createBranch', () => {
    it('creates a branch', () => {
        const branch = {
            handles: [() => {}]
        };
        const result = createBranch(branch);

        assert.deepStrictEqual(result, branch);
    });
});

describe('createErrorHandler', () => {
    it('creates a error handler', () => {
        const errorHandler = {
            contentType: 'application/json',
            handle: () => {}
        };
        const result = createErrorHandler(errorHandler);

        assert.deepStrictEqual(result, errorHandler);
    });
});

describe('createRenderer', () => {
    it('creates a renderer', () => {
        const renderer = {
            contentType: 'application/json',
            handle: () => {}
        };
        const result = createRenderer(renderer);

        assert.deepStrictEqual(result, renderer);
    });
});
