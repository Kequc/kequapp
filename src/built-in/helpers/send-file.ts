import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import Ex from '../tools/ex';
import guessContentType from '../../util/guess-content-type';
import { TPathname } from '../../types';

export default async function sendFile (req: IncomingMessage, res: ServerResponse, asset: TPathname, contentType?: string): Promise<void> {
    const location = path.join(process.cwd(), asset);
    const stats = await getStats(location);

    res.setHeader('Content-Type', contentType ?? guessContentType(asset));
    res.setHeader('Content-Length', stats.size);

    if (req.method === 'HEAD') {
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
            location,
            error
        });
    }
}

async function getStats (location: string): Promise<fs.Stats> {
    try {
        const stats = await fs.promises.stat(location);

        if (stats.isFile()) return stats;
    } catch (error) {
        // fail
    }

    throw Ex.NotFound(undefined, { location });
}
