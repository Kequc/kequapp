import { createApp, staticDirectory, staticFile } from '../../src/main'; // 'kequapp'

const app = createApp({
    routes: [
        staticDirectory('/assets/**', {
            dir: '/examples/file-server/assets',
            exclude: ['/examples/file-server/assets/private.txt']
        }),
        staticFile('/examples/file-server/assets/index.html')
    ]
});

export default app;
