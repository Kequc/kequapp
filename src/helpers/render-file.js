const path = require('path');
const fs = require('fs/promises');
const errors = require('../util/errors.js');

const MIME_TYPES = {
    '.html': 'text/html',
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

async function renderFile (req, res, pathname) {
    const method = req.method;
    const fullPathname = path.join(process.cwd(), pathname);

    try {
        const content = await fs.readFile(pathname);
        res.setHeader('Content-Type', getContentType(pathname));
        res.setHeader('Content-Length', content.length);
        if (method === 'HEAD') {
            res.end();
        } else {
            res.end(content);
        }
    } catch (error) {
        throw errors.NotFound(`Not Found: ${pathname}`, {
            request: { method, pathname },
            fullPathname
        });
    }
}

module.exports = renderFile;

function getContentType (filename) {
    var extname = path.extname(filename).toLowerCase();
    return MIME_TYPES[extname] || 'application/octet-stream';
}
