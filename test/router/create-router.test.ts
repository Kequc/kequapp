import 'kequtest';
import assert from 'assert';
import createRoute from '../../src/router/addable/create-route';

it('creates a route', () => {
    const addable = createRoute();

    assert.deepStrictEqual(addable(), {
        routes: [{
            parts: [],
            handles: [],
            method: 'GET'
        }]
    });
});
