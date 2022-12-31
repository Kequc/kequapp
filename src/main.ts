import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import createRouter from './router/create-router';
import requestProcessor from './router/request-processor';
import { TBranchData } from './types';

export { default as sendFile } from './built-in/helpers/send-file';
export { default as staticFile } from './built-in/helpers/static-file';
export { default as staticDirectory } from './built-in/helpers/static-directory';
export { default as Ex } from './built-in/tools/ex';
export { default as inject } from './built-in/tools/inject';
export * from './router/modules';

export function createApp (structure: TBranchData): RequestListener {
    const router = createRouter(structure);

    function app (req: IncomingMessage, res: ServerResponse): void {
        requestProcessor(router, req, res);
    }

    return app;
}
