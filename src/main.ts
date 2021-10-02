import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import sendFile from './addons/send-file';
import staticFiles from './addons/static-files';
import buildGetBody from './body-parser/build-get-body';
import errorHandler from './defaults/error-handler';
import errors from './util/errors';
import routeScope from './util/route-scope';
import processor from './processor';

import { Config, ConfigInput, IKequserver } from '../types/main';

const DEFAULT_OPTIONS: Config = {
    logger: console,
    renderers: {},
    errorHandler,
    maxPayloadSize: null // maybe 1e6
};

function createApp (options: ConfigInput = {}): IKequserver {
    validateConfig(options);
    const _routes = [];
    const _config = Object.assign({}, DEFAULT_OPTIONS, options);

    function app (req: IncomingMessage, res: ServerResponse, _override?: ConfigInput) {
        if (_override) validateConfig(_override);
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
            getBody: buildGetBody(req, config),
            logger: config.logger,
            errors
        });
    }

    Object.assign(app, routeScope(_routes, {
        pathname: '/',
        handles: []
    }));

    return app as IKequserver;
}

export {
    createApp,
    sendFile,
    staticFiles
};

function validateConfig (config) {
    if (typeof config !== 'object' || config === null) {
        throw new Error('Config must be an object');
    }

    if ('logger' in config) {
        if (typeof config.logger !== 'object' || config.logger === null) {
            throw new Error('Logger must be an object');
        }

        for (const key of ['log', 'error', 'warn', 'debug', 'info']) {
            if (typeof config.logger[key] !== 'function') {
                throw new Error('Method ' + key + ' missing on logger');
            }
        }
    }

    if ('renderers' in config) {
        if (typeof config.renderers !== 'object' || config.renderers === null) {
            throw new Error('Renderers must be an object');
        }

        for (const key of Object.keys(config.renderers)) {
            if (typeof config.renderers[key] !== 'function') {
                throw new Error('Method ' + key + ' missing on renderers');
            }
        }
    }

    if ('errorHandler' in config) {
        if (typeof config.errorHandler !== 'function') {
            throw new Error('Error handler must be an function');
        }
    }

    if ('maxPayloadSize' in config) {
        if (typeof config.maxPayloadSize !== 'number') {
            throw new Error('Max payload size must be a number');
        }
    }
}
