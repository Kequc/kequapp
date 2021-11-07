import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import { URL } from 'url';
import sendFile from './addons/send-file';
import staticFiles from './addons/static-files';
import createGetBody, { IGetBody } from './body/create-get-body';
import createRouter, { Router } from './router/create-router';
import requestProcessor from './router/request-processor';
import createRoutes, { Routes } from './router/create-routes';
import {
    ConfigInput,
    extendConfig,
    Logger,
    setupConfig
} from './utils/config';
import Ex from './utils/ex';


export interface IKequapp extends RequestListener, Router {
    (req: IncomingMessage, res: ServerResponse, override?: ConfigInput): void;
    routes (): Routes;
}
export type Bundle = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: BundleContext;
    params: BundleParams;
    getBody: IGetBody;
    routes: Routes;
    logger: Logger;
};
export type BundleContext = {
    [k: string]: unknown;
};
export type BundleParams = {
    [k: string]: string;
} & {
    '**'?: string[];
    '*'?: string[];
};


function createApp (options?: ConfigInput): IKequapp {
    const _routes = [];
    const _config = setupConfig(options);

    function app (req: IncomingMessage, res: ServerResponse, override?: ConfigInput) {
        const config = extendConfig(_config, override);
        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);

        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // default

        requestProcessor(config, _routes, {
            req,
            res,
            url,
            context: {},
            params: {},
            getBody: createGetBody(req, config.maxPayloadSize),
            routes: { ...routes },
            logger: config.logger
        });
    }

    const routes = createRoutes(_routes);

    Object.assign(app, createRouter(_routes, {
        pathname: '/',
        handles: []
    }), {
        routes
    });

    return app as IKequapp;
}

export {
    Ex,
    createApp,
    sendFile,
    staticFiles
};
