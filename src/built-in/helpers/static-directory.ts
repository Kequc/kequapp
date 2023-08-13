import path from 'path';
import sendFile from './send-file';
import { createHandle, createRoute } from '../../router/modules';
import { TRouteData, TParams, TPathname, TPathnameWild } from '../../types';
import { extractOptions } from '../../router/util/extract';
import guessMime from '../../util/guess-mime';
import { validateArray, validateObject, validatePathname } from '../../util/validate';
import Ex from '../tools/ex';

type TStaticDirectoryOptions = {
    url: TPathnameWild;
    dir: TPathname;
    exclude: TPathname[];
    mime: TParams;
};

const DEFAULT_OPTIONS: TStaticDirectoryOptions = {
    url: '/**',
    dir: '/public',
    exclude: [],
    mime: {}
};

interface IStaticDirectory {
    (options: Partial<TStaticDirectoryOptions>): TRouteData;
    (): TRouteData;
}

export default staticDirectory as IStaticDirectory;

function staticDirectory (...params: unknown[]): TRouteData {
    const options = extractOptions<TStaticDirectoryOptions>(params, DEFAULT_OPTIONS);

    validateOptions(options);

    const handle = createHandle(async ({ req, res, params }) => {
        const asset = path.join(options.dir, params['**']) as TPathname;

        console.log(asset);

        if (isExcluded(options.exclude, asset)) {
            throw Ex.NotFound();
        }

        console.log(guessMime(asset, options.mime));

        await sendFile(req, res, asset, guessMime(asset, options.mime));
    });

    return createRoute({
        method: 'GET',
        url: options.url,
        handles: [handle]
    });
}

function validateOptions (options: TStaticDirectoryOptions): void {
    validateObject(options, 'Static directory options');
    validatePathname(options.url, 'Static directory options.url', true);
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
