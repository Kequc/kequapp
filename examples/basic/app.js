const { createApp } = require('../../index.js'); // 'kequserver'

const app = createApp();

app.middleware(function ({ res }) {
  res.setHeader('content-type', 'application/json');
});

app.route('/cats/:id/owner', ['get'], function ({ query }) {
  return { query };
});

app.branch('/cats')
  .route(['post'], function ({ query }) {
    return { query };
  })
  .route('/:id', ['get'], function ({ query }) {
    return { query };
  })
  .route('/:id', ['put'], function ({ query }) {
    return { query };
  })
  .route('/:id', ['delete'], function ({ query }) {
    return { query };
  })
  .route(['get'], function ({ query }) {
    return { query };
  });

app.route('/', ['get'], function () {
  return { hello: 'homepage' };
});

module.exports = app;
