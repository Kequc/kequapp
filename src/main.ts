import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import { URL } from 'url';
import sendFile from './addons/send-file';
import staticFiles from './addons/static-files';
import createGetBody, { IGetBody } from './body/create-get-body';
import errorHandler from './built-in/error-handler';
import requestProcessor, { listRoutes } from './request/request-processor';
import routerScope, { RouterScope } from './request/router-scope';
import Ex from './utils/ex';
import { validateCreateAppConfig } from './utils/validate';


export interface IKequapp extends RequestListener, RouterScope {
    (req: IncomingMessage, res: ServerResponse, override?: ConfigInput): void;
    list: () => string[];
}
export type Bundle = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: BundleContext;
    params: BundleParams;
    query: BundleQuery;
    getBody: IGetBody;
    logger: Logger;
};
export type BundleContext = {
    [key: string]: any;
};
export type BundleParams = {
    [key: string]: any;
};
export type BundleQuery = {
    [key: string]: any;
};
export type Config = {
    logger: Logger;
    renderers: ConfigRenderers;
    errorHandler: ConfigErrorHandler
    maxPayloadSize?: number;
};
export type ConfigInput = {
    logger?: Logger;
    renderers?: ConfigRenderers;
    errorHandler?: ConfigErrorHandler;
    maxPayloadSize?: number;
};
export type ConfigRenderers = {
    [key: string]: Renderer;
};
export type ConfigErrorHandler = (error: any, bundle: Bundle) => any;
export type Logger = {
    log: (...params: any) => any;
    error: (...params: any) => any;
    warn: (...params: any) => any;
    debug: (...params: any) => any;
    info: (...params: any) => any;
};
export type Renderer = (payload: any, bundle: Bundle) => Promise<void> | void;


const DEFAULT_OPTIONS: Config = {
    logger: console,
    renderers: {},
    errorHandler,
    maxPayloadSize: undefined // maybe 1e6
};

function createApp (options: ConfigInput = {}): IKequapp {
    validateCreateAppConfig(options);

    const _routes = [];
    const _config = { ...DEFAULT_OPTIONS, ...options };

    function app (req: IncomingMessage, res: ServerResponse, _override: ConfigInput = {}) {
        const config = { ..._config, ..._override };

        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);
        const query = Object.fromEntries(url.searchParams);

        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // default

        requestProcessor(_routes, config, {
            req,
            res,
            url,
            context: {},
            params: {},
            query,
            getBody: createGetBody(req, config.maxPayloadSize),
            logger: config.logger
        });
    }

    function list () {
        return listRoutes(_routes);
    }

    Object.assign(app, routerScope(_routes, {
        pathname: '/',
        handles: []
    }), {
        list
    });

    return app as IKequapp;
}

export {
    Ex,
    createApp,
    sendFile,
    staticFiles
};
