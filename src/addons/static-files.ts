import path from 'path';
import sendFile from './send-file';
import { Bundle } from '../main';
import Ex from '../utils/ex';
import guessMime from '../utils/guess-mime';


type StaticFilesConfig = {
    dir: string;
    exclude: string[];
    mime: { [key: string]: string };
};
type StaticFilesConfigInput = {
    dir?: string;
    exclude?: string[];
    mime?: { [key: string]: string };
};


const DEFAULT_OPTIONS: {
    dir: string,
    exclude: string[],
    mime: { [key: string]: string };
} = {
    dir: '/public',
    exclude: [],
    mime: {}
};

function staticFiles (options: StaticFilesConfigInput = {}): (bundle: Bundle) => Promise<void> {
    const config = getConfig(options);

    return async function ({ req, res, params }: Bundle) {
        const asset = path.join(config.dir, ...(params['**'] || []));
        const mime = guessMime(asset, config.mime);

        if (isExcluded(config.exclude, asset)) {
            throw Ex.NotFound();
        }

        if (req.method === 'HEAD') {
            res.setHeader('Content-Type', mime);
            res.end();
        } else {
            await sendFile(res, asset, mime);
        }
    };
}

export default staticFiles;

function isExcluded (values: string[], asset: string): boolean {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}

function getConfig (options: StaticFilesConfigInput): StaticFilesConfig {
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

    if (options.mime) {
        if (typeof options.mime !== 'object' || options.mime === null) {
            throw new Error('staticFiles options.mime must be an object');
        }
        for (const value of Object.values(options.mime)) {
            if (typeof value !== 'string') {
                throw new Error('staticFiles options.mime value must be a string');
            }
        }
    }

    return config;
}
