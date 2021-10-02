import { ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';
import errors from '../util/errors';

const MIME_TYPES = {
    '.html': 'text/html',
    '.txt': 'text/plain',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

async function sendFile (method: string | undefined, res: ServerResponse, asset: string) {
    const location: string = path.join(process.cwd(), asset);
    const ext: string = path.extname(asset).toLowerCase();
    let contentLength = 0;

    try {
        const fileInfo = fs.statSync(location);
        if (!fileInfo.isFile()) throw new Error('Not a file');
        contentLength = fileInfo.size;
    } catch (error) {
        throw errors.NotFound(undefined, {
            method,
            location,
            ext,
            error
        });
    }

    res.setHeader('Content-Type', (MIME_TYPES[ext] || 'application/octet-stream') + '; charset=utf-8');
    res.setHeader('Content-Length', contentLength);

    if (method === 'HEAD') {
        res.end();
        return;
    }

    try {
        await new Promise((resolve, reject) => {
            const stream = fs.createReadStream(location);
            stream.pipe(res);
            stream.on('end', resolve);
            stream.on('error', reject);
            res.on('close', () => {
                stream.destroy();
            });
        });
    } catch (error) {
        throw errors.InternalServerError(undefined, {
            method,
            location,
            ext,
            error
        });
    }
}

export default sendFile;
