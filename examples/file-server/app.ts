import {
    Ex,
    createApp,
    createHandle,
    staticDirectory,
    staticFile
} from '../../src/main'; // 'kequapp'

const PRIVATE = [
    '/private.txt'
];

const setupAssets = createHandle(({ params }) => {
    if (PRIVATE.includes(params.wild)) {
        throw Ex.NotFound();
    }
});

const app = createApp({
    routes: [
        {
            method: 'GET',
            url: '/assets/**',
            handles: [
                setupAssets,
                staticDirectory({
                    location: '/examples/file-server/assets'
                })
            ]
        },
        {
            method: 'GET',
            url: '/',
            handles: [
                staticFile({
                    location: '/examples/file-server/assets/index.html'
                })
            ]
        }
    ]
});

export default app;
