import { createApp, createBranch, createHandle, createRoute, Ex } from '../../src/main'; // 'kequapp'

const loggedIn = createHandle(({ req, context }) => {
    if (req.headers.authorization !== 'mike') {
        throw Ex.Unauthorized();
    }

    context.auth = req.headers.authorization;
});

const app = createApp().add(
    createRoute(() => {
        return 'Hello world!';
    }),
    createBranch('/users').add(
        createRoute(({ url }) => {
            const query = Object.fromEntries(url.searchParams);
            return 'Query ' + JSON.stringify(query);
        }),
        createRoute('/:id', ({ params }) => {
            return `userId: ${params.id}!`;
        }),
        createRoute('POST', '/secrets', async ({ getBody }) => {
            const [body, files] = await getBody<{ name: string, age: number }>({
                multipart: true,
                required: ['name', 'age'],
                numbers: ['age']
            });
            return `${body.name} is ${body.age} and ${files[0].filename} has ${files[0].data}!`;
        }),
        createRoute('POST', async ({ getBody }) => {
            const body = await getBody<{ name: string }>({
                required: ['name']
            });
            return `User creation ${body.name}!`;
        })
    ),
    createRoute('/admin/dashboard', loggedIn, ({ context }) => {
        return `Hello admin ${context.auth}!`;
    })
);

export default app;
