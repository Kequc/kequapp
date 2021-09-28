const { createApp } = require('../../index.js'); // 'kequserver'

const app = createApp();

app.route('/', () => {
  return 'Hello world!';
});

function loggedIn ({ req, context, errors }) {
  if (req.headers.authorization !== 'mike') {
    throw errors.Unauthorized();
  }

  context.auth = req.headers.authorization;
}

app.branch('/user')
  .route(({ query }) => {
    return 'User list ' + JSON.stringify(query);
  })
  .route('/:id', ({ params }) => {
    return `userId: ${params.id}!`;
  })
  .route('POST', async ({ getBody }) => {
    const body = await getBody();
    return `User creation ${body.name}!`;
  });

app.branch('/admin', loggedIn)
  .route('/dashboard', ({ context }) => {
    return `Hello admin ${context.auth}!`;
  });

module.exports = app;
