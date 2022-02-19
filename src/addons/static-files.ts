import path from 'path';
import sendFile from './send-file';
import createRoute from '../router/create-route';
import Ex from '../util/ex';
import guessMime from '../util/guess-mime';
import { validateArray, validateObject, validatePathname, validateType } from '../util/validate';

const DEFAULT_OPTIONS: TOptions = {
    dir: '/public',
    exclude: [],
    mime: {}
};

type TOptions = {
    dir: TPathname;
    exclude: string[];
    mime: { [key: string]: string };
};

function staticFiles (pathname: TPathnameWild, options: Partial<TOptions> = {}): IRouterInstance {
    validatePathname(pathname, 'staticFiles pathname', true);
    validateOptions(options);

    const config: TOptions = { ...DEFAULT_OPTIONS, ...options };

    return createRoute(pathname, async ({ req, res, params }) => {
        const asset = path.join(config.dir, ...(params['**'] || []));
        const mime = guessMime(asset, config.mime);

        if (isExcluded(config.exclude, asset)) {
            throw Ex.NotFound();
        }

        if (req.method === 'HEAD') {
            res.setHeader('Content-Type', mime);
            res.end();
        } else {
            await sendFile(res, asset, mime);
        }
    });
}

export default staticFiles;

function validateOptions (options: Partial<TOptions>): void {
    validateObject(options, 'staticFiles options');
    validateType(options.dir, 'staticFiles options.dir', 'string');
    validateArray(options.exclude, 'staticFiles options.exclude', 'string');
    validateObject(options.mime, 'staticFiles options.mime', 'string');
}

function isExcluded (values: string[], asset: string): boolean {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}
