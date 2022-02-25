import fs from 'fs';
import path from 'path';
import Ex from '../util/ex';
import guessMime from '../util/guess-mime';

async function sendFile (res: TRes, asset: string, mime?: string): Promise<void> {
    const location: string = path.join(process.cwd(), asset);

    try {
        if (!fs.statSync(location).isFile()) throw new Error();
    } catch (error) {
        throw Ex.NotFound();
    }

    res.setHeader('Content-Type', mime || guessMime(asset));

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

export default sendFile;
