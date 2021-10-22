import { BodyJson, FilePart, RawPart } from '../get-body';
import headerAttributes from '../../util/header-attributes';
import { sanitizeContentType } from '../../util/sanitize';

function parseMultipart (parts: RawPart[]): [BodyJson, FilePart[]] {
    const result: BodyJson = {};
    const files: FilePart[] = [];
    const visited: { [key: string]: number } = {};

    for (const part of parts) {
        const { filename, name } = headerAttributes(part.headers['content-disposition']);
        const mime = sanitizeContentType(part.headers['content-type']);
        const isFile = filename || !mime.startsWith('text/');

        if (isFile) {
            files.push({ ...part, mime, name, filename });
            continue;
        }

        const key = name || 'undefined';
        const value = part.data.toString();

        visited[key] = visited[key] || 0;
        visited[key]++;
        if (visited[key] === 2) result[key] = [result[key]];

        if (visited[key] > 1) {
            result[key].push(value);
        } else {
            result[key] = value;
        }
    }

    return [result, files];
}

export default parseMultipart;
