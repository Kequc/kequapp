import { createAction, createApp, Ex, sendFile, staticDirectory } from '../../src/main.ts'; // 'kequapp'
import { silentLogger } from '../../src/util/logger.ts';

const PRIVATE = ['/private.txt'];

const setupAssets = createAction(({ params }) => {
    if (PRIVATE.includes(params.wild)) {
        throw Ex.NotFound();
    }
});

const app = createApp({
    routes: [
        {
            method: 'GET',
            url: '/assets/**',
            actions: [
                setupAssets,
                staticDirectory({
                    location: '/examples/file-server/assets',
                    index: ['index.html'],
                }),
            ],
        },
        {
            method: 'GET',
            url: '/',
            actions: [
                async ({ req, res }) => {
                    await sendFile(req, res, '/examples/file-server/assets/index.html');
                },
            ],
        },
    ],
    logger: silentLogger,
});

export default app;
