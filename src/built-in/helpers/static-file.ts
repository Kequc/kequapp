import { createHandle, createRoute } from '../../router/modules';
import { TPathname, TRouteData } from '../../types';
import { extractOptions } from '../../router/util/extract';
import { validateObject, validatePathname, validateType } from '../../util/validate';
import sendFile from './send-file';

type TStaticFileOptions = {
    url: TPathname;
    asset: TPathname;
    mime?: string;
};

const DEFAULT_OPTIONS: TStaticFileOptions = {
    url: '/**',
    asset: '/public'
};

interface IStaticFile {
    (options: Partial<TStaticFileOptions>): TRouteData;
    (): TRouteData;
}

export default staticFile as IStaticFile;

function staticFile (...params: unknown[]): TRouteData {
    const options = extractOptions<TStaticFileOptions>(params, DEFAULT_OPTIONS);

    validateOptions(options);

    const handle = createHandle(async ({ req, res }) => {
        await sendFile(req, res, options.asset, options.mime);
    });

    return createRoute({
        method: 'GET',
        url: options.url,
        handles: [handle]
    });
}

function validateOptions (options: TStaticFileOptions): void {
    validateObject(options, 'Static file options');
    validatePathname(options.url, 'Static file url');
    validatePathname(options.asset, 'Static file asset');
    validateType(options.mime, 'Static file mime', 'string');
}
