import { IncomingMessage } from 'http';
import multipart from './multipart';
import parseBody from './parse-body';
import streamReader from './stream-reader';
import headerAttributes from '../util/header-attributes';
import { sanitizeContentType } from '../util/sanitize';

import { BodyJson, RawPart, IGetBody, BodyPart } from '../../types/body-parser';

export enum BodyFormat {
    DEFAULT,
    RAW,
    MULTIPART,
    RAW_MULTIPART
}

function getBody (req: IncomingMessage, maxPayloadSize?: number): IGetBody {
    let _body: RawPart;

    return async function (format?: BodyFormat) {
        if (_body === undefined) {
            _body = await streamReader(req, maxPayloadSize);
        }

        const isMultipart = _body.headers['content-type']?.startsWith('multipart/') || false;

        switch (format) {
        case BodyFormat.RAW:
            return { ..._body };
        case BodyFormat.MULTIPART:
            if (isMultipart) {
                return parseMultipart(_body);
            } else {
                return [parseBody(_body).data, []];
            }
        case BodyFormat.RAW_MULTIPART:
            if (isMultipart) {
                return multipart(_body.data, _body.headers['content-type']);
            } else {
                return { ..._body };
            }
        default:
            if (isMultipart) {
                return parseMultipart(_body)[0];
            } else {
                return parseBody(_body).data;
            }
        }
    };
}

export default getBody;

function parseMultipart (_body: RawPart): BodyJson {
    const parts = multipart(_body.data, _body.headers['content-type']);
    const result: BodyJson = {};
    const files: BodyPart[] = [];
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
        const value = parseBody(part).data;

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
