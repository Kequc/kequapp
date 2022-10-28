import { RequestListener, IncomingMessage, ServerResponse } from 'http';
import { Transform } from 'stream';

export interface IKequapp extends RequestListener {
    (config: TConfigInput, ...handles: THandle[]): IKequapp;
    (...handles: THandle[]): IKequapp;
    add (...routers: IAddable[]): IKequapp;
    config: TConfig;
}

export type TConfigInput = {
    logger: TLogger | boolean;
    autoHead: boolean;
};
export type TConfig = {
    logger: TLogger;
    autoHead: boolean;
};
export type TLogger = {
    log: (...params: unknown[]) => void;
    error: (...params: unknown[]) => void;
    warn: (...params: unknown[]) => void;
    debug: (...params: unknown[]) => void;
};

export interface IAddable {
    (): Partial<TAddableData>;
}

export interface IAddableBranch {
    (): TAddableData;
    add (...routers: IAddable[]): IAddableBranch;
}

export type TAddableData = {
    routes: TRouteData[];
    renderers: TRendererData[];
    errorHandlers: TErrorHandlerData[];
};

export interface IRouter {
    (pathname?: string): TAddableData;
}

export type TRoute = {
    parts: string[];
    method: string;
    lifecycle: (req: IncomingMessage, res: ServerResponse) => void;
};

export type TRouteData = {
    parts: string[];
    handles: THandle[];
    method: string;
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
    <T>(format: TGetBodyOptions & { multipart: true }): Promise<[T, TFilePart[]]>;
    <T>(format?: TGetBodyOptions): Promise<T>;
}

export type TGetBodyOptions = {
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
