export type StaticFilesOptions = {
    dir?: string;
    exclude?: string[];
};

export type RawPart = {
    headers: { [key: string]: string };
    data: Buffer;
};

export type BodyPart = RawPart & {
    name?: string;
    filename?: string;
};

export type BodyJson = {
    [key: string]: any;
};
