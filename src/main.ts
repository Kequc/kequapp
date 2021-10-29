import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import { URL } from 'url';
import sendFile from './addons/send-file';
import staticFiles from './addons/static-files';
import createGetBody, { IGetBody } from './body/create-get-body';
import createRouter, { Router } from './router/create-router';
import listRoutes from './router/list-routes';
import requestProcessor from './router/request-processor';
import Ex from './utils/ex';
import setupConfig, { ConfigInput, Logger } from './utils/setup-config';


export interface IKequapp extends RequestListener, Router {
    (req: IncomingMessage, res: ServerResponse, override?: ConfigInput): void;
    list (): string[];
}
export type Bundle = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: BundleContext;
    params: BundleParams;
    getBody: IGetBody;
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


function createApp (options: ConfigInput = {}): IKequapp {
    const _routes = [];
    const _config = setupConfig(options);

    function app (req: IncomingMessage, res: ServerResponse, _override: ConfigInput = {}) {
        const config = { ..._config, ..._override };
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
            logger: config.logger
        });
    }

    function list (): string[] {
        return listRoutes(_routes);
    }

    Object.assign(app, createRouter(_routes, {
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
