import { IncomingMessage, ServerResponse } from 'http';
import createGetBody from './body/create-get-body';
import errorHandler from './built-in/error-handler';
import jsonRenderer from './built-in/json-renderer';
import textRenderer from './built-in/text-renderer';
import createBranch from './router/modules/create-branch';
import createRoute from './router/modules/create-route';
import createRouter from './router/create-router';
import requestProcessor from './router/request-processor';
import {
    IAddable,
    IKequapp,
    IRouter,
    THandle
} from './types';
export { default as createBranch } from './router/modules/create-branch';
export { default as createErrorHandler } from './router/modules/create-error-handler';
export { default as createHandle } from './router/modules/create-handle';
export { default as createRenderer } from './router/modules/create-renderer';
export { default as createRoute } from './router/modules/create-route';
export { default as sendFile } from './built-in/extra/send-file';
export { default as staticFiles } from './built-in/extra/static-files';
export { default as Ex } from './util/ex';
export { default as inject } from './inject';
export * from './types';

export function createApp (...handles: THandle[]): IKequapp {
    const branch = createBranch(...handles).add(
        errorHandler,
        jsonRenderer,
        textRenderer,
        createRoute('OPTIONS', '/**')
    );
    let router: IRouter;

    function app (req: IncomingMessage, res: ServerResponse): void {
        if (!router) router = createRouter(branch());

        requestProcessor(router, {
            req,
            res,
            url: new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`),
            getBody: createGetBody(req)
        });
    }

    function add (...params: IAddable[]): IKequapp {
        branch.add(...params);

        return app as IKequapp;
    }

    Object.assign(app, { add });

    return app as IKequapp;
}
