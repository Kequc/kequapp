type TReq = import('http').IncomingMessage;
type TRes = import('http').ServerResponse;
type TRequestListener = import('http').RequestListener;

declare module 'mock-req';
declare module 'mock-res';

// config

interface IKequapp extends TRequestListener, IAddableBranch {
    (req: TReq, res: TRes): void;
}

// bundle

type TBundle = {
    req: TReq;
    res: TRes;
    url: URL;
    context: TBundleContext;
    params: TBundleParams;
    getBody: IGetBody;
};

type TBundleContext = {
    [k: string]: unknown;
};

type TBundleParams = {
    [k: string]: string;
} & {
    '**'?: string[];
};

type TServerError = Error & {
    statusCode: number;
    info: unknown[];
};

interface IGetBody {
    (format: TBodyOptions & { raw: true, multipart: true }): Promise<TRawPart[]>;
    (format: TBodyOptions & { raw: true }): Promise<Buffer>;
    (format: TBodyOptions & { multipart: true }): Promise<[TBodyJson, TFilePart[]]>;
    (format?: TBodyOptions): Promise<TBodyJson>;
    <T>(format: TBodyOptions & { multipart: true }): Promise<[T, TFilePart[]]>;
    <T>(format?: TBodyOptions): Promise<T>;
}

type TRawPart = {
    headers: { [k: string]: string };
    data: Buffer;
};

type TFilePart = TRawPart & {
    mime?: string;
    name?: string;
    filename?: string;
};

type TBodyOptions = {
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

type TBodyJsonValue = string | number | boolean | Date | null | TBodyJson | TBodyJsonValue[];
type TBodyJson = {
    [k: string]: TBodyJsonValue;
};

interface IGetResponse {
    (format: TResponseOptions & { raw: true }): Promise<Buffer>;
    (format?: TResponseOptions): Promise<any>;
}

type TResponseOptions = {
    raw?: boolean;
};

// router

interface IAddable {
    (): Partial<TAddableData>[];
}

type TAddableData = {
    parts: string[];
    handles: THandle[];
    method: string;
    renderers: TRendererData[];
    errorHandler?: TErrorHandler;
};

interface ICreateBranch {
    (pathname: TPathname, ...handles: THandle[]): IAddableBranch;
    (...handles: THandle[]): IAddableBranch;
}

interface IAddableBranch {
    (): TAddableData[];
    add (...routers: IAddable[]): IAddableBranch;
}

interface ICreateRoute {
    (pathname: TPathname, ...handles: THandle[]): IAddable;
    (method: string, pathname: TPathname, ...handles: THandle[]): IAddable;
    (method: string, ...handles: THandle[]): IAddable;
    (...handles: THandle[]): IAddable;
}

interface ICreateRenderer {
    (mime: string, handle: TRenderer): IAddable;
}

interface ICreateErrorHandler {
    (handle: TErrorHandler): IAddable;
}

interface IRouteManager {
    (pathname?: string): TRoute[];
}

// errata

type THandle = (bundle: TBundle, routeManager: IRouteManager) => Promise<unknown> | unknown;

type TRendererData = {
    mime: string;
    handle: TRenderer;
};

type TRenderer = (payload: unknown, bundle: TBundle, routeManager: IRouteManager) => Promise<void> | void;
type TErrorHandler = (error: unknown, bundle: TBundle, routeManager: IRouteManager) => Promise<unknown> | unknown;

type TPathname = `/${string}`;
type TPathnameWild = TPathname & `${string}/**`;

type TRoute = {
    method: string;
    parts: string[];
    lifecycle: ILifecycle;
};

interface ILifecycle {
    (): Promise<void>;
}
