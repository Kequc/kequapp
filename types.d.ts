type FileData = {
    filename?: string;
    contentType?: string;
    data: Buffer;
};

type DataObject = {
    [key: string]: any;
};

type ServerError = Error & {
    statusCode: number;
    info: DataObject[];
};
