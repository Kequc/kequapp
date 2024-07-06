import fs from 'fs';
import path from 'path';
import sendFile from './send-file';
import { createAction } from '../../router/modules';
import { TParams, TPathname, TAction } from '../../types';
import guessContentType from '../../util/guess-content-type';
import { validateArray, validateExists, validateObject, validatePathname } from '../../util/validate';
import Ex from '../tools/ex';

type TStaticDirectoryOptions = {
    location: TPathname;
    index?: string[];
    contentTypes?: TParams;
};

export default function staticDirectory (options: TStaticDirectoryOptions): TAction {
    validateOptions(options);

    return createAction(async ({ req, res, params }) => {
        const location = await getLocation(options.location, params.wild, options.index);
        const contentType = guessContentType(location, options.contentTypes);

        await sendFile(req, res, location, contentType);
    });
}

function validateOptions (options: TStaticDirectoryOptions): void {
    validateExists(options, 'Static directory options');
    validateObject(options, 'Static directory options');
    validateExists(options.location, 'Static directory options.location');
    validatePathname(options.location, 'Static directory options.location');
    validateArray(options.index, 'Static directory options.index', 'string');
    validateObject(options.contentTypes, 'Static directory options.contentTypes', 'string');
}

async function getLocation (location: string, wild = '', index: string[] = []): Promise<TPathname> {
    const absolute = path.join(process.cwd(), location, wild);

    try {
        const stats = await fs.promises.stat(absolute);

        if (stats.isDirectory() && index.length > 0) {
            const files = await fs.promises.readdir(absolute);

            for (const file of index) {
                if (files.includes(file)) return path.join(location, wild, file) as TPathname;
            }
        }

        if (stats.isFile()) return path.join(location, wild) as TPathname;
    } catch (error) {
        // fail
    }

    throw Ex.NotFound(undefined, { absolute, index });
}
