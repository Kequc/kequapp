type TReq = import('http').IncomingMessage;
type TRes = import('http').ServerResponse;
type TRequestListener = import('http').RequestListener;

declare module 'mock-req';
declare module 'mock-res';

// config

interface IKequapp extends TRequestListener, IBranchInstance {
    (req: TReq, res: TRes): void;
}

type TConfig = {
    renderers: TRenderers;
    errorHandler: TErrorHandler
};

type TRenderers = {
    [k: string]: TRenderer;
};

type TErrorHandler = (error: unknown, bundle: TBundle) => unknown;
type TRenderer = (payload: unknown, bundle: TBundle) => Promise<void> | void;

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

interface IRouteManager {
    (pathname?: string): TRoute[];
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

interface IRouterInstance {
    (): TRouteData[];
}

interface IBranchInstance extends IRouterInstance {
    add (...routers: IRouterInstance[]): IBranchInstance;
}

type TPathname = `/${string}`;
type TPathnameWild = TPathname & `${string}/**`;

interface ICreateBranch {
    (pathname: TPathname, options: Partial<TConfig>, ...handles: THandle[]): IBranchInstance;
    (pathname: TPathname, ...handles: THandle[]): IBranchInstance;
    (options: Partial<TConfig>, ...handles: THandle[]): IBranchInstance;
    (...handles: THandle[]): IBranchInstance;
}

interface ICreateRoute {
    (pathname: TPathname, ...handles: THandle[]): IRouterInstance;
    (method: string, pathname: TPathname, ...handles: THandle[]): IRouterInstance;
    (method: string, ...handles: THandle[]): IRouterInstance;
    (...handles: THandle[]): IRouterInstance;
}

type TRouteData = {
    parts: string[];
    options: Partial<TConfig>;
    handles: THandle[];
    method: string;
};
type THandle = (bundle: TBundle, routeManager: IRouteManager) => Promise<unknown> | unknown;

type TRoute = {
    method: string;
    parts: string[];
    lifecycle: ILifecycle;
};

interface ILifecycle {
    (): Promise<void>;
}
