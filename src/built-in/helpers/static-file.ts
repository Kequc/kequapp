import { createHandle, createRoute } from '../../router/modules';
import { TPathname, TRouteData } from '../../types';
import { extractContentType, extractUrl } from '../../router/util/extract';
import { validatePathname, validateType } from '../../util/validate';
import sendFile from './send-file';

interface IStaticFile {
    (url: TPathname, asset: TPathname, mime: string): TRouteData;
    (url: TPathname, asset: TPathname): TRouteData;
    (asset: TPathname, mime: string): TRouteData;
    (asset: TPathname): TRouteData;
}

export default staticFile as IStaticFile;

function staticFile (...params: unknown[]): TRouteData {
    let url = extractUrl(params);
    let asset = extractUrl(params);
    const mime = extractContentType(params, undefined);

    if (asset === '/') {
        asset = url;
        url = '/';
    }

    validatePathname(url, 'Static file url');
    validatePathname(asset, 'Static file asset');
    validateType(mime, 'Static file mime', 'string');

    const handle = createHandle(async ({ req, res }) => {
        await sendFile(req, res, asset, mime);
    });

    return createRoute({
        method: 'GET',
        url,
        handles: [handle]
    });
}
