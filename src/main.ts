import { IncomingMessage, ServerResponse } from 'http';
import errorHandler from './built-in/error-handler';
import jsonRenderer from './built-in/json-renderer';
import textRenderer from './built-in/text-renderer';
import createRouter from './router/create-router';
import createBranch from './router/modules/create-branch';
import requestProcessor from './router/request-processor';
import { IAddable, IKequapp, THandle } from './types';
import { extractHandles } from './util/extract';
export { default as createBranch } from './router/modules/create-branch';
export { default as createConfig } from './router/modules/create-config';
export { default as createErrorHandler } from './router/modules/create-error-handler';
export { default as createHandle } from './router/modules/create-handle';
export { default as createRenderer } from './router/modules/create-renderer';
export { default as createRoute } from './router/modules/create-route';
export { default as sendFile } from './built-in/helpers/send-file';
export { default as staticFile } from './built-in/helpers/static-file';
export { default as staticDirectory } from './built-in/helpers/static-directory';
export { default as Ex } from './util/tools/ex';
export { default as inject } from './util/tools/inject';
export * from './types';

export function createApp (...params: unknown[]): IKequapp {
    const handles = extractHandles<THandle>(params);
    const branch = createBranch(...handles).add(
        errorHandler,
        jsonRenderer,
        textRenderer
    );
    let router = createRouter(branch());

    function app (req: IncomingMessage, res: ServerResponse): void {
        requestProcessor(router, req, res);
    }

    function add (...params: IAddable[]): IKequapp {
        branch.add(...params);
        router = createRouter(branch());

        return app as IKequapp;
    }

    Object.assign(app, { add });

    return app as IKequapp;
}
