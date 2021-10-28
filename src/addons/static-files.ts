import path from 'path';
import sendFile from './send-file';
import { StaticFilesOptions } from '../body/create-get-body';
import { Bundle } from '../main';
import Ex from '../utils/ex';

const DEFAULT_OPTIONS: {
    dir: string,
    exclude: string[]
} = {
    dir: '/public',
    exclude: []
};

function staticFiles (options: StaticFilesOptions = {}): (bundle: Bundle) => Promise<void> {
    const config = getConfig(options);

    return async function ({ req, res, params }: Bundle) {
        const asset = path.join(config.dir, params['**']);

        if (isExcluded(config.exclude, asset)) {
            throw Ex.NotFound();
        } else {
            await sendFile(req.method, res, asset);
        }
    };
}

export default staticFiles;

function isExcluded (values: string[], asset: string) {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}

function getConfig (options: StaticFilesOptions) {
    const config = { ...DEFAULT_OPTIONS };

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
