import assert from 'assert';
import 'kequtest';
import createRoute from '../../../src/router/modules/create-route';

it('creates a route', () => {
    const handles = [() => {}, () => {}];
    const addable = createRoute(...handles);

    assert.deepStrictEqual(addable(), {
        routes: [{
            parts: [],
            handles,
            method: 'GET'
        }]
    });
});

it('creates a route with method and parts', () => {
    const handles = [() => {}, () => {}];
    const addable = createRoute('POST', '/hello/there', ...handles);

    assert.deepStrictEqual(addable(), {
        routes: [{
            parts: ['hello', 'there'],
            handles,
            method: 'POST'
        }]
    });
});

it('creates a route with method', () => {
    const handles = [() => {}, () => {}];
    const addable = createRoute('POST', ...handles);

    assert.deepStrictEqual(addable(), {
        routes: [{
            parts: [],
            handles,
            method: 'POST'
        }]
    });
});

it('creates a route with parts', () => {
    const handles = [() => {}, () => {}];
    const addable = createRoute('/hello/there', ...handles);

    assert.deepStrictEqual(addable(), {
        routes: [{
            parts: ['hello', 'there'],
            handles,
            method: 'GET'
        }]
    });
});

it('throws error if missing handle', () => {
    assert.throws(() => createRoute('POST', '/hello/there'), {
        message: 'Route handle is undefined'
    });
});

it('throws error if handle not function', () => {
    // @ts-ignore
    assert.throws(() => createRoute(1), {
        message: 'Handle item must be a function'
    });
});
