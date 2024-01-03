import path from 'path';
import sendFile from './send-file';
import { createHandle } from '../../router/modules';
import { TParams, TPathname, THandle } from '../../types';
import guessContentType from '../../util/guess-content-type';
import { validateExists, validateObject, validatePathname } from '../../util/validate';

type TStaticDirectoryOptions = {
    location: TPathname;
    contentTypes?: TParams;
};

export default function staticDirectory (options: TStaticDirectoryOptions): THandle {
    validateOptions(options);

    return createHandle(async ({ req, res, params }) => {
        const location = path.join(options.location, params.wild) as TPathname;
        const contentType = guessContentType(location, options.contentTypes);

        await sendFile(req, res, location, contentType);
    });
}

function validateOptions (options: TStaticDirectoryOptions): void {
    validateExists(options, 'Static directory options');
    validateObject(options, 'Static directory options');
    validateExists(options.location, 'Static directory options.location');
    validatePathname(options.location, 'Static directory options.location');
    validateObject(options.contentTypes, 'Static directory options.contentTypes', 'string');
}
