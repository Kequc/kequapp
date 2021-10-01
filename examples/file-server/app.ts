import { createApp, staticFiles } from '../../src/index.js'; // 'kequserver'

const app = createApp();

app.route('/', () => {
    return 'Hello world!';
});

app.route('/assets/**', staticFiles({
    dir: './examples/file-server/assets',
    exclude: ['./examples/file-server/assets/private.txt']
}));

export default app;
