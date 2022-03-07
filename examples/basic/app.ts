import { createApp, createBranch, createRoute, Ex } from '../../src/main'; // 'kequapp'

const app = createApp();

app.add(createRoute(() => {
    return 'Hello world!';
}));

function loggedIn ({ req, context }) {
    if (req.headers.authorization !== 'mike') {
        throw Ex.Unauthorized();
    }
    context.auth = req.headers.authorization;
}

app.add(createBranch('/users').add(
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
));

app.add(createBranch('/admin', loggedIn).add(
    createRoute('/dashboard', ({ context }) => {
        return `Hello admin ${context.auth}!`;
    })
));

export default app;
