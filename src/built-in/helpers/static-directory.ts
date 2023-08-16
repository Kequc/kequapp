import path from 'path';
import sendFile from './send-file';
import { createHandle, createRoute } from '../../router/modules';
import { TRouteData, TParams, TPathname, TPathnameWild } from '../../types';
import guessContentType from '../../util/guess-content-type';
import { validateArray, validateExists, validateObject, validatePathname } from '../../util/validate';
import Ex from '../tools/ex';

type TStaticDirectoryOptions = {
    url?: TPathnameWild;
    dir?: TPathname;
    exclude?: TPathname[];
    contentTypes?: TParams;
};

export default function staticDirectory (options: TStaticDirectoryOptions): TRouteData {
    validateOptions(options);

    const handle = createHandle(async ({ req, res, params }) => {
        const asset = path.join(options.dir ?? '/public', params.wild) as TPathname;

        if (isExcluded(options.exclude ?? [], asset)) {
            throw Ex.NotFound();
        }

        await sendFile(req, res, asset, guessContentType(asset, options.contentTypes));
    });

    return createRoute({
        method: 'GET',
        url: options.url ?? '/**',
        handles: [handle]
    });
}

function validateOptions (options: TStaticDirectoryOptions): void {
    validateExists(options, 'Static directory options');
    validateObject(options, 'Static directory options');
    validatePathname(options.url, 'Static directory options.url', true);
    validatePathname(options.dir, 'Static directory options.dir');
    validateArray(options.exclude, 'Static directory options.exclude');
    validateObject(options.contentTypes, 'Static directory options.contentTypes', 'string');

    for (const value of options.exclude ?? []) {
        validatePathname(value, 'Static directory options.exclude');
    }
}

function isExcluded (values: string[], asset: string): boolean {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }

    return false;
}
