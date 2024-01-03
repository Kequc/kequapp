import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import Ex from '../tools/ex';
import guessContentType from '../../util/guess-content-type';
import { TPathname } from '../../types';

export default async function sendFile (req: IncomingMessage, res: ServerResponse, location: TPathname, contentType?: string): Promise<void> {
    const asset = path.join(process.cwd(), location);
    const stats = await getStats(asset);

    res.setHeader('Content-Type', contentType ?? guessContentType(location));
    res.setHeader('Content-Length', stats.size);

    if (req.method === 'HEAD') {
        res.end();
        return;
    }

    try {
        await new Promise((resolve, reject) => {
            const stream = fs.createReadStream(asset);
            stream.pipe(res);
            stream.on('end', resolve);
            stream.on('error', reject);
            res.on('close', () => {
                stream.destroy();
            });
        });
    } catch (error) {
        throw Ex.InternalServerError(undefined, {
            location: asset,
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
