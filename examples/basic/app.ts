import { BodyFormat, createApp, Ex } from '../../src/main'; // 'kequapp'

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
    .route(({ query }) => {
        return 'Query ' + JSON.stringify(query);
    })
    .route('/:id', ({ params }) => {
        return `userId: ${params.id}!`;
    })
    .route('POST', '/secrets', async ({ getBody }) => {
        const body = await getBody();
        return `${body.name} is ${body.age} and ${body.secret.filename} has ${body.secret.data}!`;
    })
    .route('POST', async ({ getBody }) => {
        const body = await getBody();
        return `User creation ${body.name}!`;
    });

app.branch('/admin', loggedIn)
    .route('/dashboard', ({ context }) => {
        return `Hello admin ${context.auth}!`;
    });

export default app;
