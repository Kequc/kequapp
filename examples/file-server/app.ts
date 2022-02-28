import { createApp, createRoute, staticFiles } from '../../src/main'; // 'kequapp'

const app = createApp();

app.add(createRoute(() => {
    return 'Hello world!';
}));

app.add(staticFiles('/assets/**', {
    dir: '/examples/file-server/assets',
    exclude: ['/examples/file-server/assets/private.txt']
}));

export default app;
