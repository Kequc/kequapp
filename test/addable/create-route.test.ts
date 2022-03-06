import 'kequtest';
import assert from 'assert';
import createRoute from '../../src/addable/create-route';

it('runs a test', function () {
    createRoute(({ getBody }) => {

    });
    assert.ok(true);
});
