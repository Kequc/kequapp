type TReq = import('http').IncomingMessage;
type TRes = import('http').ServerResponse;
type TRequestListener = import('http').RequestListener;

declare module 'mock-req';
declare module 'mock-res';

// config

interface IKequapp extends IBranchInstance {
    (req: TReq, res: TRes, override?: Partial<TConfig>): void;
}

type TConfig = {
    logger: TLogger;
    renderers: TRenderers;
    errorHandler: TErrorHandler
    autoHead: boolean;
    autoOptions: boolean;
};

type TRenderers = {
    [k: string]: TRenderer;
};

type TErrorHandler = (error: unknown, bundle: TBundle) => unknown;
type TRenderer = (payload: unknown, bundle: TBundle) => Promise<void> | void;

type TLogger = {
    log (...params: unknown[]): void;
    error (...params: unknown[]): void;
    warn (...params: unknown[]): void;
    debug (...params: unknown[]): void;
    info (...params: unknown[]): void;
};

// bundle

type TBundle = {
    req: TReq;
    res: TRes;
    url: URL;
    context: TBundleContext;
    params: TBundleParams;
    getBody: IGetBody;
    logger: TLogger;
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

type TBodyJsonValue = string | number | boolean | null | TBodyJson;
type TBodyJson = {
    [k: string]: TBodyJsonValue | TBodyJsonValue[];
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
    add (...routers: IRouterInstance[]): void;
}

interface ICreateBranch {
    (pathname: string, ...handles: THandle[]): IBranchInstance;
    (...handles: THandle[]): IBranchInstance;
}

interface ICreateRoute {
    (method: string, pathname: string, ...handles: THandle[]): IRouterInstance;
    (method: string, ...handles: THandle[]): IRouterInstance;
    (pathname: string, ...handles: THandle[]): IRouterInstance;
    (...handles: THandle[]): IRouterInstance;
}

type TBranchData = {
    parts: string[];
    handles: THandle[];
};
type TRouteData = TBranchData & {
    method: string;
};
type THandle = (bundle: TBundle, routes?: IRouteManager) => Promise<unknown> | unknown;

type TRoute = {
    method: string;
    parts: string[];
    lifecycle: ILifecycle;
};

interface ILifecycle {
    (): Promise<void>;
}
