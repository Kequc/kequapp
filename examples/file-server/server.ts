import http from 'http';
import app from './app';

const server = http.createServer(app);

server.listen(4000, function () {
    console.log('Server running on port 4000');
});
