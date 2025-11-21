import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findErrorHandler, findRenderer } from '../../src/router/find.ts';
import type { ErrorHandlerData, RendererData } from '../../src/types.ts';

describe('findRenderer', () => {
    function buildRenderer(contentType: string): RendererData {
        return { action: () => {}, contentType };
    }

    it('returns a renderer', () => {
        const renderers = [buildRenderer('application/json'), buildRenderer('text/plain')];
        assert.equal(findRenderer(renderers, 'text/plain'), renderers[1].action);
    });

    it('throws error when no renderer', () => {
        const renderers = [buildRenderer('application/json'), buildRenderer('text/plain')];
        assert.throws(() => findRenderer(renderers, 'text/html'), {
            message: 'Renderer not found',
        });
    });

    it('returns a renderer with wildcard', () => {
        const renderers = [buildRenderer('application/json'), buildRenderer('text/*')];
        assert.equal(findRenderer(renderers, 'text/plain'), renderers[1].action);
        assert.equal(findRenderer(renderers, 'text/html'), renderers[1].action);
    });

    it('prefers accurate content type', () => {
        const renderers = [
            buildRenderer('application/json'),
            buildRenderer('text/html'),
            buildRenderer('text/*'),
        ];
        assert.equal(findRenderer(renderers, 'text/plain'), renderers[2].action);
        assert.equal(findRenderer(renderers, 'text/html'), renderers[1].action);
    });

    it('returns full wildcard renderer', () => {
        const renderers = [
            buildRenderer('application/json'),
            buildRenderer('text/html'),
            buildRenderer('*'),
        ];
        assert.equal(findRenderer(renderers, 'text/plain'), renderers[2].action);
        assert.equal(findRenderer(renderers, 'text/html'), renderers[1].action);
    });
});

describe('findErrorHandler', () => {
    function buildErrorHandler(contentType: string): ErrorHandlerData {
        return { action: () => {}, contentType };
    }

    it('returns a errorHandler', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/plain'),
        ];
        assert.equal(findErrorHandler(errorHandlers, 'text/plain'), errorHandlers[1].action);
    });

    it('throws error when no errorHandler', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/plain'),
        ];
        assert.throws(() => findErrorHandler(errorHandlers, 'text/html'), {
            message: 'Error handler not found',
        });
    });

    it('returns a errorHandler with wildcard', () => {
        const errorHandlers = [buildErrorHandler('application/json'), buildErrorHandler('text/*')];
        assert.equal(findErrorHandler(errorHandlers, 'text/plain'), errorHandlers[1].action);
        assert.equal(findErrorHandler(errorHandlers, 'text/html'), errorHandlers[1].action);
    });

    it('prefers accurate content type', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/html'),
            buildErrorHandler('text/*'),
        ];
        assert.equal(findErrorHandler(errorHandlers, 'text/plain'), errorHandlers[2].action);
        assert.equal(findErrorHandler(errorHandlers, 'text/html'), errorHandlers[1].action);
    });

    it('returns full wildcard errorHandler', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/html'),
            buildErrorHandler('*'),
        ];
        assert.equal(findErrorHandler(errorHandlers, 'text/plain'), errorHandlers[2].action);
        assert.equal(findErrorHandler(errorHandlers, 'text/html'), errorHandlers[1].action);
    });
});
