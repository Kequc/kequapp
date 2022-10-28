import path from 'path';
import sendFile from './send-file';
import createRoute from '../../router/modules/create-route';
import { IAddable, TParams, TPathname, TPathnameWild } from '../../types';
import { extractOptions, extractUrl } from '../../util/extract';
import guessMime from '../../util/guess-mime';
import { validateArray, validateObject, validatePathname } from '../../util/validate';
import Ex from '../../util/tools/ex';

type TStaticDirectoryOptions = {
    dir: TPathname;
    exclude: TPathname[];
    mime: TParams;
};

const DEFAULT_OPTIONS: TStaticDirectoryOptions = {
    dir: '/public',
    exclude: [],
    mime: {}
};

interface IStaticDirectory {
    (url: TPathnameWild, options: Partial<TStaticDirectoryOptions>): IAddable;
    (url: TPathnameWild): IAddable;
    (options: Partial<TStaticDirectoryOptions>): IAddable;
    (): IAddable;
}

export default staticDirectory as IStaticDirectory;

function staticDirectory (...params: unknown[]): IAddable {
    const url = extractUrl(params, '/**');
    const options = extractOptions<TStaticDirectoryOptions>(params, DEFAULT_OPTIONS);

    validatePathname(url, 'Static directory url', true);
    validateOptions(options);

    return createRoute(url, async ({ req, res, params }) => {
        const asset = path.join(options.dir, params['**']) as TPathname;
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

function validateOptions (options: TStaticDirectoryOptions): void {
    validateObject(options, 'Static directory options');
    validatePathname(options.dir, 'Static directory options.dir');
    validateArray(options.exclude, 'Static directory options.exclude');
    validateObject(options.mime, 'Static directory options.mime', 'string');

    for (const value of options.exclude || []) {
        validatePathname(value, 'Static directory options.exclude');
    }
}

function isExcluded (values: string[], asset: string): boolean {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}
