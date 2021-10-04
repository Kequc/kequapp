import path from 'path';
import sendFile from './send-file';

import { StaticFilesOptions } from '../../types/body-parser';
import { Bundle } from '../../types/main';

const DEFAULT_OPTIONS: {
    dir: string,
    exclude: string[]
} = {
    dir: './public',
    exclude: []
};

function staticFiles (options: StaticFilesOptions = {}) {
    const config = setupConfig(options);

    return async function ({ req, res, params, errors }: Bundle) {
        const wildcards = params.wildcards || [];
        const asset = path.join(config.dir, wildcards[wildcards.length - 1]);

        if (isExcluded(config.exclude, asset)) {
            throw errors.NotFound();
        } else {
            await sendFile(req.method, res, asset);
        }
    };
}

export default staticFiles;

function isExcluded (values, asset) {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}

function setupConfig (options) {
    const config = Object.assign({}, DEFAULT_OPTIONS);

    if (options.dir) {
        if (typeof options.dir !== 'string') {
            throw new Error('staticFiles options.dir must be a string');
        }
        config.dir = options.dir;
    }

    if (options.exclude) {
        if (!Array.isArray(options.exclude)) {
            throw new Error('staticFiles options.exclude must be an array');
        }
        for (const value of options.exclude) {
            if (typeof value !== 'string') {
                throw new Error('staticFiles options.exclude value must be a string');
            }
            config.exclude.push(path.join(value));
        }
    }

    return config;
}