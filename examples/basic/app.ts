import { createApp, createBranch, createHandle, Ex } from '../../src/main'; // 'kequapp'

const loggedIn = createHandle(({ req, context }) => {
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
            handles: [
                ({ url }) => {
                    const query = Object.fromEntries(url.searchParams);

                    return 'Query ' + JSON.stringify(query);
                }
            ]
        },
        {
            method: 'GET',
            url: '/:id',
            handles: [
                ({ params }) => {
                    return `userId: ${params.id}!`;
                }
            ]
        },
        {
            method: 'POST',
            url: '/secrets',
            handles: [
                async ({ getBody }) => {
                    const [body, files] = await getBody<{ name: string, age: number }>({
                        multipart: true,
                        required: ['name', 'age'],
                        numbers: ['age']
                    });

                    return `${body.name} is ${body.age} and ${files[0].filename} has ${files[0].data}!`;
                }
            ]
        },
        {
            method: 'POST',
            handles: [
                async ({ getBody }) => {
                    const body = await getBody<{ name: string }>({
                        required: ['name']
                    });

                    return `User creation ${body.name}!`;
                }
            ]
        }
    ]
});

const app = createApp({
    routes: [
        {
            method: 'GET',
            handles: [
                () => 'Hello world!'
            ]
        },
        {
            method: 'GET',
            url: '/admin/dashboard',
            handles: [
                loggedIn,
                ({ context }) => {
                    return `Hello admin ${context.auth}!`;
                }
            ]
        }
    ],
    branches: [
        usersBranch
    ]
});

export default app;
