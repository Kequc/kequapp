import path from 'path';
import createRoute from '../addable/create-route';
import sendFile from './send-file';
import Ex from '../util/ex';
import guessMime from '../util/guess-mime';
import { validateArray, validateObject, validatePathname } from '../util/validate';
import { IAddable, TParams, TPathname, TPathnameWild } from '../types';

type TOptions = {
    dir: TPathname;
    exclude: TPathname[];
    mime: TParams;
};

const DEFAULT_OPTIONS: TOptions = {
    dir: '/public',
    exclude: [],
    mime: {}
};

export default function staticFiles (pathname: TPathnameWild = '/**', options: Partial<TOptions> = {}): IAddable {
    validatePathname(pathname, 'Static files pathname', true);
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

function validateOptions (options: Partial<TOptions>): void {
    validateObject(options, 'Static files options');
    validatePathname(options.dir, 'Static files options.dir');
    validateArray(options.exclude, 'Static files options.exclude');
    validateObject(options.mime, 'Static files options.mime', 'string');

    for (const value of options.exclude || []) {
        validatePathname(value, 'Static files options.exclude');
    }
}

function isExcluded (values: string[], asset: string): boolean {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}
