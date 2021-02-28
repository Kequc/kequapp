const kequserver = require('../index.js'); // 'kequserver'

const app = kequserver();

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

module.exports = app;
