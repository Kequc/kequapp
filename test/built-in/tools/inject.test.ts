import assert from 'node:assert/strict';
import { it } from 'node:test';
import inject from '../../../src/built-in/tools/inject.ts';
import { createApp, createRoute } from '../../../src/main.ts';

it('can return a response from the app', async () => {
    const route = createRoute({
        method: 'GET',
        actions: [() => 'hello'],
    });
    const app = createApp({
        routes: [route],
    });
    const { getResponse } = inject(app, {
        method: 'GET',
        url: '/',
    });

    const result = await getResponse();

    assert.equal(result, 'hello');
});
