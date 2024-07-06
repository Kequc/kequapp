import assert from 'assert';
import 'kequtest';
import {
    createBranch,
    createErrorHandler,
    createAction,
    createRenderer,
    createRoute
} from '../../src/router/modules';

describe('createAction', () => {
    it('creates a action', () => {
        const action = () => {};
        const result = createAction(action);

        assert.deepStrictEqual(result, action);
    });
});

describe('createRoute', () => {
    it('creates a route', () => {
        const route = {
            method: 'POST',
            actions: [() => {}]
        };
        const result = createRoute(route);

        assert.deepStrictEqual(result, route);
    });
});

describe('createBranch', () => {
    it('creates a branch', () => {
        const branch = {
            actions: [() => {}]
        };
        const result = createBranch(branch);

        assert.deepStrictEqual(result, branch);
    });
});

describe('createErrorHandler', () => {
    it('creates a error handler', () => {
        const errorHandler = {
            contentType: 'application/json',
            action: () => {}
        };
        const result = createErrorHandler(errorHandler);

        assert.deepStrictEqual(result, errorHandler);
    });
});

describe('createRenderer', () => {
    it('creates a renderer', () => {
        const renderer = {
            contentType: 'application/json',
            action: () => {}
        };
        const result = createRenderer(renderer);

        assert.deepStrictEqual(result, renderer);
    });
});
