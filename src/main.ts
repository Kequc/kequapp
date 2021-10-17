import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import sendFile from './addons/send-file';
import staticFiles from './addons/static-files';
import getBody, { BodyFormat } from './body-parser/get-body';
import errorHandler from './defaults/error-handler';
import errors from './util/errors';
import routeScope from './util/route-scope';
import { validateCreateAppConfig } from './util/validate';
import processor from './processor';

import { Config, ConfigInput, IKequapp } from '../types/main';

const DEFAULT_OPTIONS: Config = {
    logger: console,
    renderers: {},
    errorHandler,
    maxPayloadSize: undefined // maybe 1e6
};

function createApp (options: ConfigInput = {}): IKequapp {
    validateCreateAppConfig(options);
    const _routes = [];
    const _config = Object.assign({}, DEFAULT_OPTIONS, options);

    function app (req: IncomingMessage, res: ServerResponse, _override?: ConfigInput) {
        if (_override) validateCreateAppConfig(_override);
        const config = Object.assign({}, _config, _override);
        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);

        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // default

        processor(_routes, config, {
            req,
            res,
            url,
            context: {},
            params: {},
            query: Object.fromEntries(url.searchParams),
            getBody: getBody(req, config.maxPayloadSize),
            logger: config.logger,
            errors
        });
    }

    Object.assign(app, routeScope(_routes, {
        pathname: '/',
        handles: []
    }));

    return app as IKequapp;
}

export {
    createApp,
    sendFile,
    staticFiles,
    BodyFormat
};
