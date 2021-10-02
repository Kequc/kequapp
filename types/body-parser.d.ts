export type StaticFilesOptions = {
    dir?: string;
    exclude?: string[];
};

export type RawBodyPart = {
    filename?: string;
    contentType?: string;
    data: Buffer[];
};

export type BodyPart = {
    filename?: string;
    contentType?: string;
    data: JsonData[];
};

export type JsonData = {
    [key: string]: any;
};
