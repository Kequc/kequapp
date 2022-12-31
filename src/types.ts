import { IncomingMessage, ServerResponse } from 'http';
import { Transform } from 'stream';

export type TConfigInput = {
    logger: TLogger | boolean;
    autoHead: boolean;
};
export type TLogger = {
    log: (...params: unknown[]) => void;
    debug: (...params: unknown[]) => void;
    info: (...params: unknown[]) => void;
    warn: (...params: unknown[]) => void;
    error: (...params: unknown[]) => void;
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
    (method: string, parts: string[]): [TRoute, string[]];
}

export type TBranchData = {
    url?: TPathname;
    handles?: THandle[];
    branches?: TBranchData[];
    routes?: TRouteData[];
    errorHandlers?: TErrorHandlerData[];
    renderers?: TRendererData[];
    logger?: TLogger;
    autoHead?: boolean;
};
export type TRouteData = {
    method: string;
    url: TPathname;
    handles?: THandle[];
    logger?: TLogger;
    autoHead?: boolean;
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
    parts: string[];
    handles: THandle[];
    errorHandlers: TErrorHandlerData[];
    renderers: TRendererData[];
    autoHead?: boolean;
    logger?: TLogger;
};
export type TCacheRoute = TCacheBranch & {
    method: string;
};
export type TBranch = Required<TCacheBranch> & { regex: RegExp };
export type TRoute = Required<TCacheRoute> & { regex: RegExp };
