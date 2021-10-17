import { createApp, staticFiles } from '../../src/main'; // 'kequapp'

const app = createApp();

app.route('/', () => {
    return 'Hello world!';
});

app.route('/assets/**', staticFiles({
    dir: './examples/file-server/assets',
    exclude: ['./examples/file-server/assets/private.txt']
}));

export default app;
