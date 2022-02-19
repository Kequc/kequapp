import autoHead from './addons/auto-head';
import sendFile from './addons/send-file';
import staticFiles from './addons/static-files';
import createGetBody from './body/create-get-body';
import createBranch from './router/create-branch';
import createRoute from './router/create-route';
import requestProcessor from './router/request-processor';
import Ex from './util/ex';

function createApp (options: Partial<TConfig> = {}): IKequapp {
    const branch = createBranch(options);

    function app (req: TReq, res: TRes): void {
        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);

        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain'); // default

        requestProcessor(branch, {
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
    autoHead,
    sendFile,
    staticFiles
};
