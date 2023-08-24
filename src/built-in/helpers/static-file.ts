import { createHandle, createRoute } from '../../router/modules';
import { THandle, TPathname, TRouteData } from '../../types';
import {
    validateArray,
    validateContentType,
    validateExists,
    validateObject,
    validatePathname
} from '../../util/validate';
import sendFile from './send-file';

type TStaticFileOptions = {
    url?: TPathname;
    asset: TPathname;
    contentType?: string;
    handles?: THandle[];
};

export default function staticFile (options: TStaticFileOptions): TRouteData {
    validateOptions(options);

    const handle = createHandle(async ({ req, res }) => {
        await sendFile(req, res, options.asset, options.contentType);
    });

    return createRoute({
        method: 'GET',
        url: options.url,
        handles: [...options.handles ?? [], handle]
    });
}

function validateOptions (options: TStaticFileOptions): void {
    validateExists(options, 'Static file options');
    validateObject(options, 'Static file options');
    validatePathname(options.url, 'Static file url');
    validateExists(options.asset, 'Static file asset');
    validatePathname(options.asset, 'Static file asset');
    validateContentType(options.contentType, 'Static file contentType');
    validateArray(options.handles, 'Static file handles', 'function');
}
