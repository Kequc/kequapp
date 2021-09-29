const http = require('http');
const appFactory = require('./app.js');

const app = appFactory({ logger: console });
const server = http.createServer(app);

server.listen(4000, function () {
    console.log('Server running on port 4000');
});
