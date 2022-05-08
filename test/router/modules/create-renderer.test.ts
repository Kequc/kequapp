import assert from 'assert';
import 'kequtest';
import createRenderer from '../../../src/router/modules/create-renderer';

it('creates a renderer', () => {
    const handle = () => {};
    const addable = createRenderer('text/html', handle);

    assert.deepStrictEqual(addable(), {
        renderers: [{
            parts: ['**'],
            handle,
            contentType: 'text/html'
        }]
    });
});

it('creates a renderer with parts', () => {
    const handle = () => {};
    const addable = createRenderer('text/html', '/hello/there', handle);

    assert.deepStrictEqual(addable(), {
        renderers: [{
            parts: ['hello', 'there'],
            handle,
            contentType: 'text/html'
        }]
    });
});

it('throws error if content type is undefined', () => {
    const handle = () => {};
    // @ts-ignore
    assert.throws(() => createRenderer(undefined, handle), {
        message: 'Renderer handle is undefined'
    });
});

it('throws error if invalid content type', () => {
    const handle = () => {};
    // @ts-ignore
    assert.throws(() => createRenderer(1, handle), {
        message: 'Handle item must be a function'
    });
});

it('throws error if handle is undefined', () => {
    // @ts-ignore
    assert.throws(() => createRenderer('text/html', undefined), {
        message: 'Renderer handle is undefined'
    });
});

it('throws error if handle not function', () => {
    // @ts-ignore
    assert.throws(() => createRenderer('text/html', 1), {
        message: 'Handle item must be a function'
    });
});
