import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import { URL } from 'url';
import errorHandler from './defaults/error-handler';
import sendFile from './helpers/send-file';
import staticFiles from './helpers/static-files';
import buildMethodScope, { MethodScope } from './util/build-method-scope';
import errors, { ErrorsHelper } from './util/errors';
import streamReader from './util/stream-reader';
import processor from './processor';
import { ServerConfigRenderers } from './render';

export type ServerBundle = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: DataObject;
    params: DataObject;
    query: DataObject;
    getBody: () => Promise<DataObject>;
    logger: Console;
    errors: ErrorsHelper;
};

type ServerConfigInput = {
    logger?: Console;
    renderers?: ServerConfigRenderers;
    errorHandler?: ServerConfigErrorHandler;
    mayPayloadSize?: number | null;
};

export type ServerConfig = {
    logger: Console;
    renderers: ServerConfigRenderers;
    errorHandler: ServerConfigErrorHandler
    maxPayloadSize: number | null;
};

export type ServerConfigErrorHandler = (error: ServerError, bundle: ServerBundle) => any;

const DEFAULT_OPTIONS: ServerConfig = {
    logger: console,
    renderers: {},
    errorHandler,
    maxPayloadSize: null // maybe 1e6
};

export interface Kequserver extends RequestListener, MethodScope {};

function createApp (options: ServerConfigInput = {}): Kequserver {
    const routes = [];
    const config = Object.assign({}, DEFAULT_OPTIONS, options);

    function app (req: IncomingMessage, res: ServerResponse, logger = config.logger) {
        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // default

        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);
        const query = Object.fromEntries(url.searchParams);

        let _body;

        async function getBody () {
            if (_body === undefined) {
                _body = await streamReader(req, config.maxPayloadSize);
            }
            return _body;
        }

        processor(routes, config, {
            req,
            res,
            url,
            context: {},
            params: {},
            query,
            getBody,
            logger,
            errors
        });
    }

    Object.assign(app, buildMethodScope(routes, {
        pathname: '/',
        handles: []
    }));

    return app as Kequserver;
}

export {
    createApp,
    sendFile,
    staticFiles
};
