const http = require('http');
const app = require('./app.js');

const server = http.createServer(app);

server.listen(4000, function () {
  console.log('Server running on port 4000');
});
