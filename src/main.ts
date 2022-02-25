import createBranch from './addable/create-branch';
import createErrorHandler from './addable/create-error-handler';
import createRenderer from './addable/create-renderer';
import createRoute from './addable/create-route';
import createGetBody from './body/create-get-body';
import autoHead from './extra/auto-head';
import sendFile from './extra/send-file';
import staticFiles from './extra/static-files';
import requestProcessor from './router/request-processor';
import Ex from './util/ex';

function createApp (): IKequapp {
    const branch = createBranch();
    let _cache: TAddableData[];

    function app (req: TReq, res: TRes): void {
        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);

        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain'); // default

        if (!_cache) _cache = branch();

        requestProcessor(_cache, {
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

export {
    Ex,
    createApp,
    createBranch,
    createRoute,
    createRenderer,
    createErrorHandler,
    autoHead,
    sendFile,
    staticFiles
};
