import { RequestListener, IncomingMessage, ServerResponse } from 'http';

export interface IKequapp extends RequestListener {
    add (...routers: IAddable[]): IKequapp;
}

export interface IAddable {
    (): Partial<TAddableData>;
}

export type TAddableData = {
    routes: TRouteData[];
    renderers: TRendererData[];
    errorHandlers: TErrorHandlerData[];
};

export type TRouteData = {
    parts: string[];
    handles: THandle[];
    method: string;
};

export interface ICreateBranch {
    (pathname: TPathname, ...handles: THandle[]): IAddableBranch;
    (...handles: THandle[]): IAddableBranch;
}

export interface IAddableBranch {
    (): TAddableData;
    add (...routers: IAddable[]): IAddableBranch;
}

export interface ICreateRoute {
    (method: string, pathname: TPathname, ...handles: THandle[]): IAddable;
    (pathname: TPathname, ...handles: THandle[]): IAddable;
    (method: string, ...handles: THandle[]): IAddable;
    (...handles: THandle[]): IAddable;
}

export interface ICreateRenderer {
    (pathname: TPathname, contentType: string, handle: TRenderer): IAddable;
    (contentType: string, handle: TRenderer): IAddable;
}

export interface ICreateErrorHandler {
    (pathname: TPathname, contentType: string, handle: TErrorHandler): IAddable;
    (pathname: TPathname, handle: TErrorHandler): IAddable;
    (contentType: string, handle: TErrorHandler): IAddable;
    (handle: TErrorHandler): IAddable;
}

export interface ICreateHandle {
    (handle: THandle): THandle;
}

export type THandle = (bundle: TBundle) => Promise<unknown> | unknown;

export type TRenderer = (payload: unknown, bundle: TBundle) => Promise<void> | void;

export type TErrorHandler = (error: unknown, bundle: TBundle) => Promise<unknown> | unknown;

export interface IRouter {
    (pathname?: string): TAddableData;
}

export type TRoute = {
    parts: string[];
    method: string;
    lifecycle: (req: IncomingMessage, res: ServerResponse) => void;
};

export type TRendererData = {
    parts: string[];
    contentType: string;
    handle: TRenderer;
};

export type TErrorHandlerData = {
    parts: string[];
    contentType: string;
    handle: TErrorHandler;
};

export type TPathname = `/${string}`;

export type TPathnameWild = TPathname & `${string}/**`;

export interface ILifecycle {
    (): Promise<void>;
}

export interface IGetResponse {
    (format: ServerResponseponseOptions & { raw: true }): Promise<Buffer>;
    (format?: ServerResponseponseOptions): Promise<any>;
}

export type ServerResponseponseOptions = {
    raw?: boolean;
};

export type TBundle = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: TBundleContext;
    params: TBundleParams;
    getBody: IGetBody;
};

export type TBundleContext = {
    [k: string]: unknown;
};

export type TParams = { [k: string]: string };

export type TBundleParams = TParams & {
    '**'?: string[];
};

export type THeader = string | number | string[] | undefined;

export interface IGetBody {
    (format: TBodyOptions & { raw: true, multipart: true }): Promise<TRawPart[]>;
    (format: TBodyOptions & { raw: true }): Promise<Buffer>;
    (format: TBodyOptions & { multipart: true }): Promise<[TBodyJson, TFilePart[]]>;
    (format?: TBodyOptions): Promise<TBodyJson>;
    <T>(format: TBodyOptions & { multipart: true }): Promise<[T, TFilePart[]]>;
    <T>(format?: TBodyOptions): Promise<T>;
}

export type TRawPart = {
    headers: TParams;
    data: Buffer;
};

export type TFilePart = TRawPart & {
    mime?: string;
    name?: string;
    filename?: string;
};

export type TBodyOptions = {
    raw?: boolean;
    multipart?: boolean;
    maxPayloadSize?: number;
    skipNormalize?: boolean;
    arrays?: string[];
    numbers?: string[];
    booleans?: string[];
    required?: string[];
    validate? (body: TBodyJson): string | void;
    postProcess? (body: TBodyJson): TBodyJson;
};

export type TBodyJsonValue = string | number | boolean | Date | null | TBodyJson | TBodyJsonValue[];

export type TBodyJson = {
    [k: string]: TBodyJsonValue;
};

export type TServerError = Error & {
    statusCode: number;
    info: unknown[];
};

export type TInjectOptions = {
    method: string;
    url: string;
    headers: TParams;
    rawHeaders: TParams;
    body: unknown;
};
