import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { Pathname } from '../../types.ts';
import { guessContentType } from '../../util/guess-content-type.ts';
import { Ex } from '../tools/ex.ts';

export async function sendFile(
    req: IncomingMessage,
    res: ServerResponse,
    location: Pathname,
    contentType?: string,
): Promise<void> {
    const asset = path.join(process.cwd(), location);
    const stats = await getStats(asset);

    res.setHeader('Content-Type', contentType ?? guessContentType(location));
    res.setHeader('Content-Length', stats.size);

    if (req.method === 'HEAD') {
        res.end();
        return;
    }

    try {
        await new Promise<void>((resolve, reject) => {
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
            error,
        });
    }
}

async function getStats(location: string): Promise<fs.Stats> {
    try {
        const stats = await fs.promises.stat(location);

        if (stats.isFile()) return stats;
    } catch (_error) {
        // fail
    }

    throw Ex.NotFound(undefined, { location });
}
