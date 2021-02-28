const http = require('http');
const kequserver = require('./index.js');

const app = kequserver();
const server = http.createServer(app);

const trail = app.trail('/hello/world');

trail.route('/woo', ['get'], function ({ query }) {
  return { query };
});

server.listen(4000, function () {
  console.log('Server running on port 4000');
});
