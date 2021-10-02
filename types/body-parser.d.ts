export type StaticFilesOptions = {
    dir?: string;
    exclude?: string[];
};

export type RawBodyPart = {
    filename?: string;
    contentType?: string;
    data: Buffer;
};

export type BodyPart = {
    filename?: string;
    contentType?: string;
    data: any[];
};

export type BodyOptions = {
    full?: boolean;
    parse?: boolean;
};
