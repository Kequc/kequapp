import { IncomingMessage, ServerResponse } from 'http';
import createGetBody from './body/create-get-body';
import errorHandler from './built-in/error-handler';
import jsonRenderer from './built-in/json-renderer';
import textRenderer from './built-in/text-renderer';
import createBranch from './router/addable/create-branch';
import createRequestProcessor from './router/create-request-processor';
import createRouter from './router/create-router';
import { IAddable, IKequapp, IRouter } from './types';
export { default as createBranch } from './router/addable/create-branch';
export { default as createErrorHandler } from './router/addable/create-error-handler';
export { default as createRenderer } from './router/addable/create-renderer';
export { default as createRoute } from './router/addable/create-route';
export { default as autoHead } from './built-in/extra/auto-head';
export { default as sendFile } from './built-in/extra/send-file';
export { default as staticFiles } from './built-in/extra/static-files';
export { default as Ex } from './util/ex';
export * from './types';

export function createApp (): IKequapp {
    const branch = createBranch().add(
        errorHandler,
        jsonRenderer,
        textRenderer
    );
    let router: IRouter;

    function app (req: IncomingMessage, res: ServerResponse): void {
        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);
        const method = req.method || 'GET';
        const pathname = url.pathname;

        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain'); // default

        if (!router) router = createRouter(branch());

        createRequestProcessor(router, {
            req,
            res,
            url,
            context: {},
            params: {},
            getBody: createGetBody(req)
        })(method, pathname).then(() => {
            // debug
            console.debug(res.statusCode, method, pathname);
        });
    }

    function add (...params: IAddable[]): IKequapp {
        branch.add(...params);

        return app as IKequapp;
    }

    Object.assign(app, { add });

    return app as IKequapp;
}
