import { IncomingMessage, ServerResponse } from 'http';
import createGetBody from './body/create-get-body';
import errorHandler from './built-in/error-handler';
import jsonRenderer from './built-in/json-renderer';
import textRenderer from './built-in/text-renderer';
import createBranch from './router/addable/create-branch';
import requestProcessor from './router/request-processor';
import { IKequapp, TRouteData } from './types';
export { default as createBranch } from './router/addable/create-branch';
export { default as createErrorHandler } from './router/addable/create-error-handler';
export { default as createRenderer } from './router/addable/create-renderer';
export { default as createRoute } from './router/addable/create-route';
export { default as autoHead } from './built-in/extra/auto-head';
export { default as sendFile } from './built-in/extra/send-file';
export { default as staticFiles } from './built-in/extra/static-files';
export { default as Ex } from './util/ex';

export function createApp (): IKequapp {
    const branch = createBranch().add(
        errorHandler,
        jsonRenderer,
        textRenderer
    );
    let routes: TRouteData[];

    function app (req: IncomingMessage, res: ServerResponse): void {
        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);

        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain'); // default

        if (!routes) routes = branch().routes || [];

        requestProcessor(routes, {
            req,
            res,
            url,
            context: {},
            params: {},
            getBody: createGetBody(req)
        });
    }

    Object.assign(app, branch);

    return app as IKequapp;
}
