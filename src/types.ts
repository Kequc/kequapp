import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FakeReq, FakeRes } from './util/fake-http.ts';

export type TLoggerFn = (...params: unknown[]) => void;
export interface TLogger {
    error: TLoggerFn;
    warn: TLoggerFn;
    info: TLoggerFn;
}

export type TAction = (bundle: TBundle) => Promise<unknown> | unknown;
export type TRenderer = (
    payload: unknown,
    bundle: TBundle,
) => Promise<void> | void;
export type TErrorHandler = (
    ex: TServerEx,
    bundle: TBundle,
) => Promise<unknown> | unknown;

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
}

export interface TBundleContext {
    [k: string]: unknown;
}

export interface TCookieOptions {
    domain?: string;
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
    // prettier-ignore
    (format: TGetBodyOptions & { raw: true; multipart: true }): Promise<TRawPart[]>;
    // prettier-ignore
    (format: TGetBodyOptions & { raw: true }): Promise<Buffer>;
    // prettier-ignore
    <T>(format: TGetBodyOptions<T> & { multipart: true; throws: false }): Promise<[TValidationResult<T>, TFilePart[]]>;
    // prettier-ignore
    <T>(format: TGetBodyOptions<T> & { multipart: true }): Promise<[T, TFilePart[]]>;
    // prettier-ignore
    <T>(format: TGetBodyOptions<T> & { throws: false }): Promise<TValidationResult<T>>;
    // prettier-ignore
    <T>(format?: TGetBodyOptions<T>): Promise<T>;
}

export type TValidationResult<T> =
    | ({ ok: true } & T)
    | { ok: false; errors: { [K in keyof T]?: string } };

export interface TGetBodyOptions<T = TBodyJson> {
    raw?: boolean;
    multipart?: boolean;
    maxPayloadSize?: number;
    skipNormalize?: boolean;
    arrays?: string[];
    numbers?: string[];
    booleans?: string[];
    required?: string[];
    trim?: boolean;
    validate?: {
        [K in keyof T]?: (value: T[K], body: T) => string | undefined;
    };
    throws?: boolean;
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
}

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
    req: FakeReq;
    res: FakeRes;
    getResponse: IGetResponse;
}

export type IRouter = (
    method: string,
    url: string,
) => [TRoute, TParams, string[]];

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
