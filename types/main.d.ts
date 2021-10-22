import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import { IGetBody } from '../src/body-parser/get-body';
import { RouteScope } from './route-scope';

export interface IKequapp extends RequestListener, RouteScope {
    (req: IncomingMessage, res: ServerResponse, override?: ConfigInput): void;
}

export type Bundle = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: BundleContext;
    params: BundleParams;
    query: BundleQuery;
    getBody: IGetBody;
    logger: Logger;
};

export type BundleContext = {
    [key: string]: any;
};

export type BundleParams = {
    [key: string]: any;
};

export type BundleQuery = {
    [key: string]: any;
};

export type ConfigInput = {
    logger?: Logger;
    renderers?: ConfigRenderers;
    errorHandler?: ConfigErrorHandler;
    maxPayloadSize?: number;
};

export type Config = {
    logger: Logger;
    renderers: ConfigRenderers;
    errorHandler: ConfigErrorHandler
    maxPayloadSize?: number;
};

export type Logger = {
    log: (...params: any) => any;
    error: (...params: any) => any;
    warn: (...params: any) => any;
    debug: (...params: any) => any;
    info: (...params: any) => any;
};

export type ConfigErrorHandler = (error: any, bundle: Bundle) => any;

export type ConfigRenderers = {
    [key: string]: Renderer;
};

export type Renderer = (payload: any, bundle: Bundle) => Promise<void> | void;
