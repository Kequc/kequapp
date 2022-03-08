import { IncomingMessage, ServerResponse } from 'http';
export { default as createBranch } from './addable/create-branch';
import createBranch from './addable/create-branch';
export { default as createErrorHandler } from './addable/create-error-handler';
export { default as createRenderer } from './addable/create-renderer';
export { default as createRoute } from './addable/create-route';
import createGetBody from './body/create-get-body';
import errorHandler from './built-in/error-handler';
import jsonRenderer from './built-in/json-renderer';
import textRenderer from './built-in/text-renderer';
export { default as autoHead } from './extra/auto-head';
export { default as sendFile } from './extra/send-file';
export { default as staticFiles } from './extra/static-files';
import requestProcessor from './router/request-processor';
import { IKequapp, TRouteData } from './types';
export { default as Ex } from './util/ex';

export function createApp (): IKequapp {
    const branch = createBranch();
    let routes: TRouteData[];

    branch.add(
        errorHandler,
        jsonRenderer,
        textRenderer
    );

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
