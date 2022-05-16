import assert from 'assert';
import 'kequtest';
import { createApp, createRoute } from '../../../src/main';
import inject from '../../../src/util/tools/inject';

it('can return a response from the app', async () => {
    const app = createApp().add(createRoute(() => 'hello'));
    const { getResponse } = inject(app, {
        method: 'GET',
        url: '/'
    });

    const result = await getResponse();

    assert.strictEqual(result, 'hello');
});
