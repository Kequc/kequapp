import path from 'path';
import sendFile from './send-file';
import createRoute from '../../router/addable/create-route';
import { IAddable, TParams, TPathname } from '../../types';
import Ex from '../../util/ex';
import { extractOptions, extractPathname } from '../../util/extract';
import guessMime from '../../util/guess-mime';
import { validateArray, validateObject, validatePathname } from '../../util/validate';

type TStaticFilesOptions = {
    dir: TPathname;
    exclude: TPathname[];
    mime: TParams;
};

const DEFAULT_OPTIONS: TStaticFilesOptions = {
    dir: '/public',
    exclude: [],
    mime: {}
};

interface IStaticFiles {
    (pathname: TPathname, options: Partial<TStaticFilesOptions>): IAddable;
    (pathname: TPathname): IAddable;
    (options: Partial<TStaticFilesOptions>): IAddable;
    (): IAddable;
}

function staticFiles (...params: unknown[]): IAddable {
    const pathname = extractPathname(params, '/**');
    const options = extractOptions<TStaticFilesOptions>(params, DEFAULT_OPTIONS);

    validatePathname(pathname, 'Static files pathname', true);
    validateOptions(options);

    return createRoute(pathname, async ({ req, res, params }) => {
        const asset = path.join(options.dir, ...(params['**'] || []));
        const mime = guessMime(asset, options.mime);

        if (isExcluded(options.exclude, asset)) {
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

export default staticFiles as IStaticFiles;

function validateOptions (options: TStaticFilesOptions): void {
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
