import { createHandle } from '../../router/modules';
import { THandle, TPathname } from '../../types';
import {
    validateContentType,
    validateExists,
    validateObject,
    validatePathname
} from '../../util/validate';
import sendFile from './send-file';

type TStaticFileOptions = {
    location: TPathname;
    contentType?: string;
};

export default function staticFile (options: TStaticFileOptions): THandle {
    validateOptions(options);

    return createHandle(async ({ req, res }) => {
        await sendFile(req, res, options.location, options.contentType);
    });
}

function validateOptions (options: TStaticFileOptions): void {
    validateExists(options, 'Static file options');
    validateObject(options, 'Static file options');
    validateExists(options.location, 'Static file options.location');
    validatePathname(options.location, 'Static file options.location');
    validateContentType(options.contentType, 'Static file options.contentType');
}
