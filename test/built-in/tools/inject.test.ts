import assert from 'assert';
import 'kequtest';
import { createApp, createRoute } from '../../../src/main';
import inject from '../../../src/built-in/tools/inject';

it('can return a response from the app', async () => {
    const route = createRoute({
        method: 'GET',
        handles: [() => 'hello']
    });
    const app = createApp({
        routes: [route]
    });
    const { getResponse } = inject(app, {
        method: 'GET',
        url: '/'
    });

    const result = await getResponse();

    assert.strictEqual(result, 'hello');
});
