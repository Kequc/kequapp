import path from 'path';
import sendFile from './send-file';
import createRoute from '../router/create-route';
import Ex from '../util/ex';
import guessMime from '../util/guess-mime';

const DEFAULT_OPTIONS: {
    dir: TPathname,
    exclude: string[],
    mime: { [key: string]: string };
} = {
    dir: '/public',
    exclude: [],
    mime: {}
};

type TOptions = {
    dir?: TPathname;
    exclude?: string[];
    mime?: { [key: string]: string };
};

function staticFiles (pathname: TPathnameWild, options: TOptions = {}): IRouterInstance {
    // additional validation
    if (typeof pathname === 'string' && !pathname.endsWith('/**')) {
        throw new Error('staticFiles pathname must end with \'/**\'');
    }

    validateOptions(options);

    const config = { ...DEFAULT_OPTIONS, ...options };

    return createRoute(pathname, async ({ req, res, params }) => {
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
    });
}

export default staticFiles;

function validateOptions (options: TOptions): void {
    if (typeof options !== 'object' || options === null) {
        throw new Error('staticFiles options must be an object');
    }

    if (options.dir) {
        if (typeof options.dir !== 'string') {
            throw new Error('staticFiles options.dir must be a string');
        }
    }

    if (options.exclude) {
        if (!Array.isArray(options.exclude)) {
            throw new Error('staticFiles options.exclude must be an array');
        }
        for (const value of options.exclude) {
            if (typeof value !== 'string') {
                throw new Error('staticFiles options.exclude value must be a string');
            }
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
}

function isExcluded (values: string[], asset: string): boolean {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}
