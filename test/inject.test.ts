import 'kequtest';
import assert from 'assert';
import inject from '../src/inject';
import { createApp, createRoute } from '../src/main';

it('can return a response from the app', async () => {
    const app = createApp().add(createRoute(() => 'hello'));
    const { getResponse } = inject(app, {
        method: 'GET',
        url: '/'
    });

    const result = await getResponse();

    assert.strictEqual(result, 'hello');
});
