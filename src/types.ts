import { IncomingMessage, ServerResponse } from 'http';
import { Transform } from 'stream';

export type TLoggerLvl = (...params: unknown[]) => void;
export type TLogger = {
    log: TLoggerLvl;
    error: TLoggerLvl;
    warn: TLoggerLvl;
    info: TLoggerLvl;
    http: TLoggerLvl;
    verbose: TLoggerLvl;
    debug: TLoggerLvl;
    silly: TLoggerLvl;
};

export type THandle = (bundle: TBundle) => Promise<unknown> | unknown;
export type TRenderer = (payload: unknown, bundle: TBundle) => Promise<void> | void;
export type TErrorHandler = (ex: TServerEx, bundle: TBundle) => Promise<unknown> | unknown;

export type TPathname = `/${string}`;
export type TPathnameWild = TPathname & `${string}/**`;
export type THeader = string | number | string[] | undefined;
export type THeaders = { [key: string]: THeader };
export type TParams = { [k: string]: string };

export type TBundle = {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: TBundleContext;
    params: TParams;
    methods: string[];
    getBody: IGetBody;
    logger: TLogger;
};

export type TBundleContext = {
    [k: string]: unknown;
};

export interface IGetBody {
    (format: TGetBodyOptions & { raw: true, multipart: true }): Promise<TRawPart[]>;
    (format: TGetBodyOptions & { raw: true }): Promise<Buffer>;
    (format: TGetBodyOptions & { multipart: true }): Promise<[TBodyJson, TFilePart[]]>;
    (format?: TGetBodyOptions): Promise<TBodyJson>;
    <T>(format: TGetBodyOptions<T> & { multipart: true }): Promise<[T, TFilePart[]]>;
    <T>(format?: TGetBodyOptions<T>): Promise<T>;
}

export type TGetBodyOptions<T = TBodyJson> = {
    raw?: boolean;
    multipart?: boolean;
    maxPayloadSize?: number;
    skipNormalize?: boolean;
    arrays?: string[];
    numbers?: string[];
    booleans?: string[];
    required?: string[];
    validate? (body: T): string | void;
};

export interface IGetResponse {
    (format: TGetResponseOptions & { raw: true }): Promise<Buffer>;
    (format?: TGetResponseOptions): Promise<any>;
}

export type TReqOptions = {
    [key: string]: any;
    method?: string;
    url?: string;
    headers?: TParams;
    rawHeaders?: string[];
    body?: unknown;
};

export type TGetResponseOptions = {
    raw?: boolean;
};

export type TRawPart = {
    headers: TParams;
    data: Buffer;
};

export type TFilePart = TRawPart & {
    mime?: string;
    name?: string;
    filename?: string;
};

export type TBodyJsonValue = string | number | boolean | Date | null | TBodyJson | TBodyJsonValue[];
export type TBodyJson = {
    [k: string]: TBodyJsonValue;
};

export type TServerEx = Error & {
    statusCode: number;
    info: unknown[];
};

export type TInject = {
    req: IncomingMessage & Transform;
    res: ServerResponse & Transform;
    getResponse: IGetResponse;
};

export interface IRouter {
    (method: string, url: string): [TRoute, TParams, string[]];
}

export type TRouteData = {
    method: string;
    url?: TPathname;
    handles?: THandle[];
    logger?: Partial<TLogger>;
    autoHead?: boolean;
};
export type TBranchData = Omit<TRouteData, 'method'> & {
    routes?: TRouteData[];
    branches?: TBranchData[];
    errorHandlers?: TErrorHandlerData[];
    renderers?: TRendererData[];
};
export type TRendererData = {
    contentType: string;
    handle: TRenderer;
};
export type TErrorHandlerData = {
    contentType: string;
    handle: TErrorHandler;
};

export type TCacheBranch = {
    url: TPathname;
    handles: THandle[];
    errorHandlers: TErrorHandlerData[];
    renderers: TRendererData[];
    autoHead?: boolean;
    logger?: Partial<TLogger>;
};
export type TCacheRoute = TCacheBranch & {
    method: string;
};
export type TBranch = Omit<TCacheBranch, 'url'> & {
    regexp: RegExp;
    autoHead: boolean;
    logger: TLogger;
};
export type TRoute = Omit<TCacheRoute, 'url'> & {
    regexp: RegExp;
    autoHead: boolean;
    logger: TLogger;
};
