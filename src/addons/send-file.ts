import fs from 'fs';
import { ServerResponse } from 'http';
import path from 'path';
import Ex from '../utils/ex';

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

async function sendFile (method: string | undefined, res: ServerResponse, asset: string, mime?: string): Promise<void> {
    const location: string = path.join(process.cwd(), asset);
    const ext: string = path.extname(asset).toLowerCase();
    const contentType = mime || MIME_TYPES[ext] || 'application/octet-stream';

    try {
        const fileInfo = fs.statSync(location);
        if (!fileInfo.isFile()) throw new Error('Not a file');
    } catch (error) {
        throw Ex.NotFound(undefined, {
            method,
            location,
            ext,
            error
        });
    }

    res.setHeader('Content-Type', contentType + '; charset=utf-8');

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
        throw Ex.InternalServerError(undefined, {
            method,
            location,
            ext,
            error
        });
    }
}

export default sendFile;
