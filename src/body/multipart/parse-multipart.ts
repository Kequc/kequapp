import type {
    TBodyJson,
    TBodyJsonValue,
    TFilePart,
    TRawPart,
} from '../../types.ts';
import headerAttributes from '../../util/header-attributes.ts';

export default function parseMultipart(
    parts: TRawPart[],
): [TBodyJson, TFilePart[]] {
    const result: TBodyJson = {};
    const files: TFilePart[] = [];
    const counters: { [k: string]: number } = {};

    for (const part of parts) {
        const { filename, name } = headerAttributes(
            part.headers['content-disposition'],
        );
        const contentType = getContentType(part.headers['content-type']);
        const isFile = filename ?? !contentType.startsWith('text/');

        if (isFile) {
            files.push({ ...part, contentType, name, filename });
            continue;
        }

        const key = name ?? 'undefined';
        const value = part.data.toString();

        counters[key] = counters[key] ?? 0;
        counters[key]++;

        if (counters[key] === 2) {
            // convert to array
            result[key] = [result[key]];
        }

        if (counters[key] > 1) {
            // add to array
            (result[key] as TBodyJsonValue[]).push(value);
        } else {
            // set value
            result[key] = value;
        }
    }

    return [result, files];
}

function getContentType(contentType?: string): string {
    return contentType?.split(';')[0].toLowerCase().trim() ?? 'text/plain';
}
