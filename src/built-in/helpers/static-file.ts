import createRoute from '../../router/modules/create-route';
import { IAddable, TPathname } from '../../types';
import { extractContentType, extractUrl } from '../../util/extract';
import { validatePathname, validateType } from '../../util/validate';
import sendFile from './send-file';

interface IStaticFile {
    (url: TPathname, asset: TPathname, mime: string): IAddable;
    (url: TPathname, asset: TPathname): IAddable;
    (asset: TPathname, mime: string): IAddable;
    (asset: TPathname): IAddable;
}

export default staticFile as IStaticFile;

function staticFile (...params: unknown[]): IAddable {
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

    return createRoute(url, async ({ req, res }) => {
        await sendFile(req, res, asset, mime);
    });
}
