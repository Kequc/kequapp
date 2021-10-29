import { createApp, Ex } from '../../src/main'; // 'kequapp'

const app = createApp();

app.route('/', () => {
    return 'Hello world!';
});

function loggedIn ({ req, context }) {
    if (req.headers.authorization !== 'mike') {
        throw Ex.Unauthorized();
    }
    context.auth = req.headers.authorization;
}

app.branch('/user')
    .route(({ url }) => {
        const query = Object.fromEntries(url.searchParams);
        return 'Query ' + JSON.stringify(query);
    })
    .route('/:id', ({ params }) => {
        return `userId: ${params.id}!`;
    })
    .route('POST', '/secrets', async ({ getBody }) => {
        const [body, files] = await getBody({ multipart: true });
        return `${body.name} is ${body.age} and ${files[0].filename} has ${files[0].data}!`;
    })
    .route('POST', async ({ getBody }) => {
        const body = await getBody<{ name: string }>();
        return `User creation ${body.name}!`;
    });

app.branch('/admin', loggedIn)
    .route('/dashboard', ({ context }) => {
        return `Hello admin ${context.auth}!`;
    });

export default app;
