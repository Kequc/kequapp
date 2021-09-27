const { createApp } = require('../../index.js'); // 'kequserver'

const app = createApp();

app.route('/', ['get'], () => {
  return 'Hello world!';
});

function loggedIn ({ req }) {
  return {
    auth: req.headers['authorization']
  };
}

app.branch('/user')
  .route(['get'], ({ query }) => {
    return 'User list ' + JSON.stringify(query);
  })
  .route('/:id', ['get'], ({ params }) => {
    return `userId: ${params.id}!`;
  });

app.branch('/admin', loggedIn)
  .route('/dashboard', ['get'], ({ context }) => {
    return `Hello admin ${context.auth}!`;
  });

app.route('/user', ['post'], async ({ getBody }) => {
  const body = await getBody();
  return `User creation ${body.name}!`;
});

module.exports = app;
