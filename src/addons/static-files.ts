import path from 'path';
import sendFile from './send-file';
import Ex from '../util/ex';
import guessMime from '../util/guess-mime';


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

function staticFiles (options: StaticFilesConfigInput = {}): (bundle: TBundle) => Promise<void> {
    const config = setupConfig(options);

    return async function ({ req, res, params }: TBundle) {
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

function setupConfig (options: StaticFilesConfigInput): StaticFilesConfig {
    const config = { ...DEFAULT_OPTIONS, ...options };

    if (config.dir) {
        if (typeof config.dir !== 'string') {
            throw new Error('staticFiles options.dir must be a string');
        }
    }

    if (config.exclude) {
        if (!Array.isArray(config.exclude)) {
            throw new Error('staticFiles options.exclude must be an array');
        }
        for (const value of config.exclude) {
            if (typeof value !== 'string') {
                throw new Error('staticFiles options.exclude value must be a string');
            }
        }
    }

    if (config.mime) {
        if (typeof config.mime !== 'object' || config.mime === null) {
            throw new Error('staticFiles options.mime must be an object');
        }
        for (const value of Object.values(config.mime)) {
            if (typeof value !== 'string') {
                throw new Error('staticFiles options.mime value must be a string');
            }
        }
    }

    return config;
}
