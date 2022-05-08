import assert from 'assert';
import 'kequtest';
import createErrorHandler from '../../../src/router/modules/create-error-handler';

it('creates a error handler', () => {
    const handle = () => {};
    const addable = createErrorHandler(handle);

    assert.deepStrictEqual(addable(), {
        errorHandlers: [{
            parts: ['**'],
            handle,
            contentType: '*'
        }]
    });
});

it('creates a error handler with content type', () => {
    const handle = () => {};
    const addable = createErrorHandler('text/html', handle);

    assert.deepStrictEqual(addable(), {
        errorHandlers: [{
            parts: ['**'],
            handle,
            contentType: 'text/html'
        }]
    });
});

it('creates a error handler with parts', () => {
    const handle = () => {};
    const addable = createErrorHandler('/hello/there', handle);

    assert.deepStrictEqual(addable(), {
        errorHandlers: [{
            parts: ['hello', 'there'],
            handle,
            contentType: '*'
        }]
    });
});

it('creates a error handler with content type and parts', () => {
    const handle = () => {};
    const addable = createErrorHandler('text/html', '/hello/there', handle);

    assert.deepStrictEqual(addable(), {
        errorHandlers: [{
            parts: ['hello', 'there'],
            handle,
            contentType: 'text/html'
        }]
    });
});

it('throws error if handle is undefined', () => {
    // @ts-ignore
    assert.throws(() => createErrorHandler(undefined), {
        message: 'Error handler handle is undefined'
    });
});

it('throws error if invalid content type', () => {
    const handle = () => {};
    // @ts-ignore
    assert.throws(() => createErrorHandler(1, handle), {
        message: 'Handle item must be a function'
    });
});

it('throws error if handle not function', () => {
    // @ts-ignore
    assert.throws(() => createErrorHandler('text/html', 1), {
        message: 'Handle item must be a function'
    });
});
