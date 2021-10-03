export type StaticFilesOptions = {
    dir?: string;
    exclude?: string[];
};

export type RawBodyPart = {
    contentType?: string;
    contentDisposition?: string;
    data: Buffer;
};

export type BodyPart = {
    contentType?: string;
    contentDisposition?: string;
    data: any;
};

export type BodyJson = {
    [key: string]: any;
};
