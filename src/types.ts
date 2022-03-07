export type TReq = import('http').IncomingMessage;
export type TRes = import('http').ServerResponse;
export type TRequestListener = import('http').RequestListener;

export interface IKequapp extends TRequestListener, IAddableBranch {
    (req: TReq, res: TRes): void;
}

export interface IAddable {
    (): Partial<TAddableData>[];
}

export type TAddableData = {
    parts: string[];
    handles: THandle[];
    method: string;
    renderers: TRendererData[];
    errorHandler?: TErrorHandler;
};

export interface ICreateBranch {
    (pathname: TPathname, ...handles: THandle[]): IAddableBranch;
    (...handles: THandle[]): IAddableBranch;
}

export interface IAddableBranch {
    (): TAddableData[];
    add (...routers: IAddable[]): IAddableBranch;
}

export interface ICreateRoute {
    (pathname: TPathname, ...handles: THandle[]): IAddable;
    (method: string, pathname: TPathname, ...handles: THandle[]): IAddable;
    (method: string, ...handles: THandle[]): IAddable;
    (...handles: THandle[]): IAddable;
}

export interface ICreateRenderer {
    (mime: string, handle: TRenderer): IAddable;
}

export interface ICreateErrorHandler {
    (handle: TErrorHandler): IAddable;
}

export interface IRouteManager {
    (pathname?: string): TRoute[];
}

export type THandle = (bundle: TBundle, routeManager: IRouteManager) => Promise<unknown> | unknown;

export type TRendererData = {
    mime: string;
    handle: TRenderer;
};

export type TRenderer = (payload: unknown, bundle: TBundle, routeManager: IRouteManager) => Promise<void> | void;
export type TErrorHandler = (error: unknown, bundle: TBundle, routeManager: IRouteManager) => Promise<unknown> | unknown;

export type TPathname = `/${string}`;
export type TPathnameWild = TPathname & `${string}/**`;

export type TRoute = {
    method: string;
    parts: string[];
    lifecycle: ILifecycle;
};

export interface ILifecycle {
    (): Promise<void>;
}

export interface IGetResponse {
    (format: TResponseOptions & { raw: true }): Promise<Buffer>;
    (format?: TResponseOptions): Promise<any>;
}

export type TResponseOptions = {
    raw?: boolean;
};

export type TBundle = {
    req: TReq;
    res: TRes;
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
    search: string;
    body: unknown;
};

export type TInject = {
    req: TReq;
    res: TRes;
    getResponse: IGetResponse;
};
