import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FakeReq, FakeRes } from './util/fake-http.ts';

export type LoggerFn = (...params: unknown[]) => void;
export interface Logger {
    error: LoggerFn;
    warn: LoggerFn;
    info: LoggerFn;
}

export type Action = (bundle: Bundle) => Promise<unknown> | unknown;
export type Renderer = (
    payload: unknown,
    bundle: Bundle,
) => Promise<void> | void;
export type ErrorHandler = (
    ex: ServerEx,
    bundle: Bundle,
) => Promise<unknown> | unknown;

export type Pathname = `/${string}`;
export type PathnameWild = Pathname & `${string}/**`;
export type Header = string | number | string[] | undefined;
export type Headers = Record<string, Header>;
export type Params = Record<string, string>;

export interface Bundle {
    req: IncomingMessage;
    res: ServerResponse;
    url: URL;
    context: BundleContext;
    params: Params;
    methods: string[];
    cookies: Cookies;
    getBody: GetBody;
}

export interface BundleContext {
    [k: string]: unknown;
}

export interface CookieOptions {
    domain?: string;
    expires?: Date;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface Cookies {
    get: (key: string) => string | undefined;
    set: (key: string, value: string, options?: CookieOptions) => void;
    remove: (key: string) => void;
}

export interface GetBody {
    // prettier-ignore
    (format: GetBodyOptions & { raw: true; multipart: true }): Promise<RawPart[]>;
    // prettier-ignore
    (format: GetBodyOptions & { raw: true }): Promise<Buffer>;
    // prettier-ignore
    <T>(format: GetBodyOptions<T> & { multipart: true; throws: false }): Promise<[ValidationResult<T>, FilePart[]]>;
    // prettier-ignore
    <T>(format: GetBodyOptions<T> & { multipart: true }): Promise<[T, FilePart[]]>;
    // prettier-ignore
    <T>(format: GetBodyOptions<T> & { throws: false }): Promise<ValidationResult<T>>;
    // prettier-ignore
    <T>(format?: GetBodyOptions<T>): Promise<T>;
}

export type ValidationResult<T> =
    | ({ ok: true } & T)
    | { ok: false; errors: { [K in keyof T]?: string } };

export interface GetBodyOptions<T = BodyJson> {
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

export interface GetResponse {
    (format: GetResponseOptions & { raw: true }): Promise<Buffer>;
    (format?: GetResponseOptions): Promise<any>;
}

export interface ReqOptions extends Record<string, any> {
    method?: string;
    url?: string;
    headers?: Params;
    rawHeaders?: string[];
    body?: unknown;
}

export interface GetResponseOptions {
    raw?: boolean;
}

export interface RawPart {
    headers: Params;
    data: Buffer;
}

export interface FilePart extends RawPart {
    contentType?: string;
    name?: string;
    filename?: string;
}

export type BodyJsonValue =
    | string
    | number
    | boolean
    | Date
    | null
    | BodyJson
    | BodyJsonValue[];
export interface BodyJson {
    [k: string]: BodyJsonValue;
}

export interface ServerEx extends Error {
    statusCode: number;
    info: Record<string, unknown>;
}

export interface Inject {
    req: FakeReq;
    res: FakeRes;
    getResponse: GetResponse;
}

export type Router = (method: string, url: string) => [Route, Params, string[]];

export interface RouteData {
    method: string;
    url?: Pathname;
    actions?: Action[];
    logger?: Partial<Logger>;
    autoHead?: boolean;
}
export interface BranchData extends Omit<RouteData, 'method'> {
    routes?: RouteData[];
    branches?: BranchData[];
    errorHandlers?: ErrorHandlerData[];
    renderers?: RendererData[];
}
export interface RendererData {
    contentType: string;
    action: Renderer;
}
export interface ErrorHandlerData {
    contentType: string;
    action: ErrorHandler;
}

export interface CacheBranch {
    url: Pathname;
    actions: Action[];
    errorHandlers: ErrorHandlerData[];
    renderers: RendererData[];
    autoHead?: boolean;
    logger?: Partial<Logger>;
}
export interface CacheRoute extends CacheBranch {
    method: string;
}
export interface Branch extends Omit<CacheBranch, 'url'> {
    regexp: RegExp;
    autoHead: boolean;
    logger: Logger;
}
export interface Route extends Omit<CacheRoute, 'url'> {
    regexp: RegExp;
    autoHead: boolean;
    logger: Logger;
}
