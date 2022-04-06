import path from 'path';
import sendFile from './send-file';
import createRoute from '../../router/addable/create-route';
import { IAddable, TParams, TPathname } from '../../types';
import Ex from '../../util/ex';
import { extractOptions, extractUrl } from '../../util/extract';
import guessMime from '../../util/guess-mime';
import { validateArray, validateObject, validatePathname } from '../../util/validate';

type TStaticFilesOptions = {
    dir: TPathname;
    exclude: TPathname[];
    mime: TParams;
};

const DEFAULT_OPTIONS: TStaticFilesOptions = {
    dir: '/public',
    exclude: [],
    mime: {}
};

interface IStaticFiles {
    (url: TPathname, options: Partial<TStaticFilesOptions>): IAddable;
    (url: TPathname): IAddable;
    (options: Partial<TStaticFilesOptions>): IAddable;
    (): IAddable;
}

export default staticFiles as IStaticFiles;

function staticFiles (...params: unknown[]): IAddable {
    const url = extractUrl(params, '/**');
    const options = extractOptions<TStaticFilesOptions>(params, DEFAULT_OPTIONS);

    validatePathname(url, 'Static files url', true);
    validateOptions(options);

    return createRoute(url, async ({ req, res, params }) => {
        const asset = path.join(options.dir, params['**']);
        const mime = guessMime(asset, options.mime);

        if (isExcluded(options.exclude, asset)) {
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

function validateOptions (options: TStaticFilesOptions): void {
    validateObject(options, 'Static files options');
    validatePathname(options.dir, 'Static files options.dir');
    validateArray(options.exclude, 'Static files options.exclude');
    validateObject(options.mime, 'Static files options.mime', 'string');

    for (const value of options.exclude || []) {
        validatePathname(value, 'Static files options.exclude');
    }
}

function isExcluded (values: string[], asset: string): boolean {
    for (const value of values) {
        if (asset.startsWith(value)) return true;
    }
    return false;
}
