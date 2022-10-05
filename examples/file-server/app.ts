import { createApp, createRoute, staticFiles } from '../../src/main'; // 'kequapp'

const app = createApp().add(
    createRoute(() => {
        return 'Hello world!';
    }),
    staticFiles('/assets/**', {
        dir: '/examples/file-server/assets',
        exclude: ['/examples/file-server/assets/private.txt']
    })
);

export default app;
