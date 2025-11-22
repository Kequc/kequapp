import { createAction, createApp, createBranch, Ex } from '../../src/index.ts'; // 'kequapp'
import { silentLogger } from '../../src/util/logger.ts';

const loggedIn = createAction(({ req, context }) => {
    if (req.headers.authorization !== 'mike') {
        throw Ex.Unauthorized();
    }

    context.auth = req.headers.authorization;
});

const usersBranch = createBranch({
    url: '/users',
    routes: [
        {
            method: 'GET',
            actions: [
                ({ url }) => {
                    const query = Object.fromEntries(url.searchParams);

                    return `Query ${JSON.stringify(query)}`;
                },
            ],
        },
        {
            method: 'GET',
            url: '/:id',
            actions: [
                ({ params }) => {
                    return `userId: ${params.id}!`;
                },
            ],
        },
        {
            method: 'POST',
            url: '/secrets',
            actions: [
                async ({ getBody }) => {
                    const [body, files] = await getBody<{
                        name: string;
                        age: number;
                    }>({
                        multipart: true,
                        required: ['name', 'age'],
                        numbers: ['age'],
                    });

                    return `${body.name} is ${body.age} and ${files[0].filename} has ${files[0].data}!`;
                },
            ],
        },
        {
            method: 'POST',
            actions: [
                async ({ getBody }) => {
                    const body = await getBody<{ name: string }>({
                        required: ['name'],
                    });

                    return `User creation ${body.name}!`;
                },
            ],
        },
    ],
});

export default createApp({
    routes: [
        {
            method: 'GET',
            actions: [() => 'Hello world!'],
        },
        {
            method: 'GET',
            url: '/admin/dashboard',
            actions: [
                loggedIn,
                ({ context }) => {
                    return `Hello admin ${context.auth}!`;
                },
            ],
        },
    ],
    branches: [usersBranch],
    logger: silentLogger,
});
