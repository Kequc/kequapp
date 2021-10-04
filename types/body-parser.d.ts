export type StaticFilesOptions = {
    dir?: string;
    exclude?: string[];
};

export type BodyPart = {
    headers: { [key: string]: string };
    name?: string;
    filename?: string;
    data: any;
};

export type BodyJson = {
    [key: string]: any;
};
