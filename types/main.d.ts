import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import { JsonData } from './body-parser';
import { ErrorsHelper } from './errors';
import { RouteScope } from './route-scope';

export interface IKequserver extends RequestListener, RouteScope {}

export type Bundle = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: BundleContext;
    params: BundleParams;
    query: BundleQuery;
    getBody: () => Promise<JsonData>;
    logger: Console;
    errors: ErrorsHelper;
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
    logger?: Console;
    renderers?: ConfigRenderers;
    errorHandler?: ConfigErrorHandler;
    mayPayloadSize?: number | null;
};

export type Config = {
    logger: Console;
    renderers: ConfigRenderers;
    errorHandler: ConfigErrorHandler
    maxPayloadSize: number | null;
};

export type ConfigErrorHandler = (error: any, bundle: Bundle) => any;

export type ConfigRenderers = {
    [key: string]: Renderer;
};

export type Renderer = (payload: any, bundle: Bundle) => void;
