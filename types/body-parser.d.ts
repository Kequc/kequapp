import { BodyFormat } from '../src/main';

export interface IGetBody {
    (format?: BodyFormat.DEFAULT): Promise<BodyJson>;
    (format: BodyFormat.RAW): Promise<RawPart>;
    (format: BodyFormat.MULTIPART): Promise<[BodyJson, BodyPart[]]>;
    (format: BodyFormat.RAW_MULTIPART): Promise<RawPart[]>;
}

export type StaticFilesOptions = {
    dir?: string;
    exclude?: string[];
};

export type RawPart = {
    headers: { [key: string]: string };
    data: Buffer;
};

export type BodyPart = RawPart & {
    mime?: string;
    name?: string;
    filename?: string;
};

export type BodyJson = {
    [key: string]: any;
};
