import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Transform } from 'node:stream';

export type TLoggerLvl = (...params: unknown[]) => void;
export interface TLogger {
    log: TLoggerLvl;
    error: TLoggerLvl;
    warn: TLoggerLvl;
    info: TLoggerLvl;
    http: TLoggerLvl;
    verbose: TLoggerLvl;
    debug: TLoggerLvl;
    silly: TLoggerLvl;
}

export type TAction = (bundle: TBundle) => Promise<unknown> | unknown;
export type TRenderer = (payload: unknown, bundle: TBundle) => Promise<void> | void;
export type TErrorHandler = (ex: TServerEx, bundle: TBundle) => Promise<unknown> | unknown;

export type TPathname = `/${string}`;
export type TPathnameWild = TPathname & `${string}/**`;
export type THeader = string | number | string[] | undefined;
export type THeaders = Record<string, THeader>;
export type TParams = Record<string, string>;

export interface TBundle {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: TBundleContext;
    params: TParams;
    methods: string[];
    cookies: TCookies;
    getBody: IGetBody;
    logger: TLogger;
}

export interface TBundleContext {
    [k: string]: unknown;
}

export interface TCookieOptions {
    expires?: Date;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface TCookies {
    get: (key: string) => string | undefined;
    set: (key: string, value: string, options?: TCookieOptions) => void;
    remove: (key: string) => void;
}

export interface IGetBody {
    (
        format: TGetBodyOptions & { raw: true; multipart: true },
    ): Promise<TRawPart[]>;
    (format: TGetBodyOptions & { raw: true }): Promise<Buffer>;
    (
        format: TGetBodyOptions & { multipart: true },
    ): Promise<[TBodyJson, TFilePart[]]>;
    (format?: TGetBodyOptions): Promise<TBodyJson>;
    <T>(
        format: TGetBodyOptions<T> & { multipart: true },
    ): Promise<[T, TFilePart[]]>;
    <T>(format?: TGetBodyOptions<T>): Promise<T>;
}

export interface TGetBodyOptions<T = TBodyJson> {
    raw?: boolean;
    multipart?: boolean;
    maxPayloadSize?: number;
    skipNormalize?: boolean;
    arrays?: string[];
    numbers?: string[];
    booleans?: string[];
    required?: string[];
    validate?(body: T): string | undefined;
}

export interface IGetResponse {
    (format: TGetResponseOptions & { raw: true }): Promise<Buffer>;
    // biome-ignore lint/suspicious/noExplicitAny: simplicity
    (format?: TGetResponseOptions): Promise<any>;
}

// biome-ignore lint/suspicious/noExplicitAny: simplicity
export interface TReqOptions extends Record<string, any> {
    method?: string;
    url?: string;
    headers?: TParams;
    rawHeaders?: string[];
    body?: unknown;
}

export interface TGetResponseOptions {
    raw?: boolean;
}

export interface TRawPart {
    headers: TParams;
    data: Buffer;
};

export interface TFilePart extends TRawPart {
    contentType?: string;
    name?: string;
    filename?: string;
}

export type TBodyJsonValue =
    | string
    | number
    | boolean
    | Date
    | null
    | TBodyJson
    | TBodyJsonValue[];
export interface TBodyJson {
    [k: string]: TBodyJsonValue;
}

export interface TServerEx extends Error {
    statusCode: number;
    info: Record<string, unknown>;
}

export interface TInject {
    req: IncomingMessage & Transform;
    res: ServerResponse & Transform;
    getResponse: IGetResponse;
}

export type IRouter = (method: string, url: string) => [TRoute, TParams, string[]];

export interface TRouteData {
    method: string;
    url?: TPathname;
    actions?: TAction[];
    logger?: Partial<TLogger>;
    autoHead?: boolean;
}
export interface TBranchData extends Omit<TRouteData, 'method'> {
    routes?: TRouteData[];
    branches?: TBranchData[];
    errorHandlers?: TErrorHandlerData[];
    renderers?: TRendererData[];
}
export interface TRendererData {
    contentType: string;
    action: TRenderer;
}
export interface TErrorHandlerData {
    contentType: string;
    action: TErrorHandler;
}

export interface TCacheBranch {
    url: TPathname;
    actions: TAction[];
    errorHandlers: TErrorHandlerData[];
    renderers: TRendererData[];
    autoHead?: boolean;
    logger?: Partial<TLogger>;
}
export interface TCacheRoute extends TCacheBranch {
    method: string;
}
export interface TBranch extends Omit<TCacheBranch, 'url'> {
    regexp: RegExp;
    autoHead: boolean;
    logger: TLogger;
}
export interface TRoute extends Omit<TCacheRoute, 'url'> {
    regexp: RegExp;
    autoHead: boolean;
    logger: TLogger;
}
