import sendFile from './addons/send-file';
import staticFiles from './addons/static-files';
import createGetBody from './body/create-get-body';
import createBranch from './router/create-branch';
import createRoute from './router/create-route';
import requestProcessor from './router/request-processor';
import { extendConfig, setupConfig } from './util/config';
import Ex from './util/ex';

function createApp (options?: Partial<TConfig>): IKequapp {
    const config = setupConfig(options);
    const branch = createBranch();

    function app (req: TReq, res: TRes, override?: Partial<TConfig>): void {
        const reqConfig = extendConfig(config, override);
        const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);
        const bundle = {
            req,
            res,
            url,
            context: {},
            params: {},
            getBody: createGetBody(req),
            logger: reqConfig.logger
        };

        res.statusCode = 200; // default
        res.setHeader('Content-Type', 'text/plain'); // default

        requestProcessor(reqConfig, branch, bundle);
    }

    Object.assign(app, branch);

    return app as IKequapp;
}

export {
    Ex,
    createApp,
    createBranch,
    createRoute,
    sendFile,
    staticFiles
};
