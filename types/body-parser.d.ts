import { BodyFormat } from '../src/main';

export interface IGetBody {
    (format?: BodyFormat): Promise<any>;
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
    mimeType?: string;
    name?: string;
    filename?: string;
};

export type BodyJson = {
    [key: string]: any;
};
