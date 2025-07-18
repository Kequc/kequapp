import http from 'node:http';
import app from './app.ts';

const server = http.createServer(app);

server.listen(4000, () => {
    console.log('Server running on port 4000');
});
