import { IncomingMessage, ServerResponse } from 'http';
import createGetBody from './body/create-get-body';
import errorHandler from './built-in/error-handler';
import jsonRenderer from './built-in/json-renderer';
import textRenderer from './built-in/text-renderer';
import createRouter from './router/create-router';
import createBranch from './router/modules/create-branch';
import requestProcessor from './router/request-processor';
import {
    IAddable,
    IKequapp,
    IRouter,
    TConfig,
    THandle
} from './types';
import { extractHandles, extractOptions } from './util/extract';
export { default as createBranch } from './router/modules/create-branch';
export { default as createErrorHandler } from './router/modules/create-error-handler';
export { default as createHandle } from './router/modules/create-handle';
export { default as createRenderer } from './router/modules/create-renderer';
export { default as createRoute } from './router/modules/create-route';
export { default as sendFile } from './built-in/helpers/send-file';
export { default as staticFiles } from './built-in/helpers/static-files';
export { default as Ex } from './util/tools/ex';
export { default as inject } from './util/tools/inject';
export * from './types';

export function createApp (...params: unknown[]): IKequapp {
    const config = extractOptions<TConfig>(params, {
        silent: false,
        autoHead: true,
    });
    const handles = extractHandles<THandle>(params);
    const branch = createBranch(...handles).add(
        errorHandler,
        jsonRenderer,
        textRenderer
    );
    let router: IRouter;

    function app (req: IncomingMessage, res: ServerResponse): void {
        if (!router) router = createRouter(branch());

        requestProcessor(router, config, {
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

    Object.assign(app, { add, config });

    return app as IKequapp;
}
