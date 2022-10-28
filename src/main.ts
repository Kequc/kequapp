import { IncomingMessage, ServerResponse } from 'http';
import errorHandler from './built-in/error-handler';
import jsonRenderer from './built-in/json-renderer';
import textRenderer from './built-in/text-renderer';
import createRouter from './router/create-router';
import createBranch from './router/modules/create-branch';
import requestProcessor from './router/request-processor';
import { IAddable, IKequapp, TConfig, THandle } from './types';
import { extractHandles, extractOptions } from './util/extract';
import { validateExists, validateObject, validateType } from './util/validate';
export { default as createBranch } from './router/modules/create-branch';
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

const DEFAULT_CONFIG: TConfig = {
    logger: console,
    autoHead: true
};

export function createApp (...params: unknown[]): IKequapp {
    const config = extractOptions<TConfig>(params, DEFAULT_CONFIG);
    const handles = extractHandles<THandle>(params);
    const branch = createBranch(...handles).add(
        errorHandler,
        jsonRenderer,
        textRenderer
    );
    let router = createRouter(config, branch());

    validateConfig(config);

    function app (req: IncomingMessage, res: ServerResponse): void {
        requestProcessor(router, config, req, res);
    }

    function add (...params: IAddable[]): IKequapp {
        branch.add(...params);
        router = createRouter(config, branch());

        return app as IKequapp;
    }

    Object.assign(app, { add });

    return app as IKequapp;
}

function validateConfig (config: TConfig): void {
    if (typeof config.logger === 'boolean') {
        config.logger = config.logger ? DEFAULT_CONFIG.logger : {
            debug () {},
            log () {},
            warn () {},
            error () {}
        };
    }

    validateExists(config.logger, 'Config logger');
    validateObject(config.logger, 'Config logger', 'function');
    validateExists(config.logger.debug, 'Config logger debug');
    validateExists(config.logger.log, 'Config logger log');
    validateExists(config.logger.warn, 'Config logger warn');
    validateExists(config.logger.error, 'Config logger error');
    validateType(config.autoHead, 'Config autoHead', 'boolean');
}
