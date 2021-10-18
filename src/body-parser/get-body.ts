import { IncomingMessage } from 'http';
import multipart from './multipart';
import parseBody from './parse-body';
import streamReader from './stream-reader';

import { BodyJson, RawPart, IGetBody } from '../../types/body-parser';
import headerAttributes from '../util/header-attributes';

export enum BodyFormat {
    DEFAULT,
    RAW,
    RAW_MULTIPART,
}

function getBody (req: IncomingMessage, maxPayloadSize?: number): IGetBody {
    let _body: RawPart;

    return async function (format) {
        if (_body === undefined) {
            _body = await streamReader(req, maxPayloadSize);
        }

        const isMultipart = _body.headers['content-type']?.startsWith('multipart/') || false;

        switch (format) {
        case BodyFormat.RAW:
            return { ..._body };
        case BodyFormat.RAW_MULTIPART:
            if (isMultipart) {
                return multipart(_body.data, _body.headers['content-type']);
            } else {
                return { ..._body };
            }
        default:
            if (isMultipart) {
                return parseMultipart(_body);
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
    const visited: { [key: string]: number } = {};

    for (const part of parts) {
        const { filename, name } = headerAttributes(part.headers['content-disposition']);

        const key = name || 'undefined';
        const body = parseBody(part);
        const isFile = filename || Buffer.isBuffer(body.data);
        const value = isFile ? { ...body, filename } : body.data;

        visited[key] = visited[key] || 0;
        visited[key]++;
        if (visited[key] === 2) body[key] = [body[key]];

        if (visited[key] > 1) {
            result[key].push(value);
        } else {
            result[key] = value;
        }
    }

    return result;
}
