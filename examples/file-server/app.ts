import { createApp, createRoute, staticFiles, autoHead } from '../../src/main'; // 'kequapp'

const app = createApp();

app.add(autoHead());

app.add(createRoute(() => {
    return 'Hello world!';
}));

app.add(staticFiles('/assets/**', {
    dir: '/examples/file-server/assets',
    exclude: ['/examples/file-server/assets/private.txt']
}));

export default app;
