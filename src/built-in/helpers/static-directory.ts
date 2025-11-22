import fs from 'node:fs';
import path from 'node:path';
import { createAction } from '../../router/modules.ts';
import type { Action, Params, Pathname } from '../../types.ts';
import { guessContentType } from '../../util/guess-content-type.ts';
import {
    validateArray,
    validateExists,
    validateObject,
    validatePathname,
} from '../../util/validate.ts';
import { Ex } from '../tools/ex.ts';
import { sendFile } from './send-file.ts';

interface TStaticDirectoryOptions {
    location: Pathname;
    index?: string[];
    contentTypes?: Params;
}

export function staticDirectory(options: TStaticDirectoryOptions): Action {
    validateOptions(options);

    return createAction(async ({ req, res, params }) => {
        const location = await getLocation(options.location, params.wild, options.index);
        const contentType = guessContentType(location, options.contentTypes);

        await sendFile(req, res, location, contentType);
    });
}

function validateOptions(options: TStaticDirectoryOptions): void {
    validateExists(options, 'Static directory options');
    validateObject(options, 'Static directory options');
    validateExists(options.location, 'Static directory options.location');
    validatePathname(options.location, 'Static directory options.location');
    validateArray(options.index, 'Static directory options.index', 'string');
    validateObject(options.contentTypes, 'Static directory options.contentTypes', 'string');
}

async function getLocation(location: string, wild = '', index: string[] = []): Promise<Pathname> {
    const absolute = path.join(process.cwd(), location, wild);

    try {
        const stats = await fs.promises.stat(absolute);

        if (stats.isDirectory() && index.length > 0) {
            const files = await fs.promises.readdir(absolute);

            for (const file of index) {
                if (files.includes(file)) return path.join(location, wild, file) as Pathname;
            }
        }

        if (stats.isFile()) return path.join(location, wild) as Pathname;
    } catch (_error) {
        // fail
    }

    throw Ex.NotFound(undefined, { absolute, index });
}
