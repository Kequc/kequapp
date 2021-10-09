import { IncomingMessage } from 'http';
import multipart from './multipart';
import parseBody from './parse-body';
import streamReader from './stream-reader';

import { BodyJson, BodyPart } from '../../types/body-parser';
import { IGetBody } from '../../types/main';

export enum BodyFormat {
    DEFAULT,
    RAW,
    MULTIPART,
    RAW_MULTIPART
}

function getBody (req: IncomingMessage, maxPayloadSize?: number): IGetBody {
    let _body: BodyPart;

    return async function (format) {
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
                return [{ ..._body }];
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

function parseMultipart (_body: BodyPart): [BodyJson, BodyPart[]] {
    const parts = multipart(_body.data, _body.headers['content-type']);
    const body: BodyJson = {};
    const files: BodyPart[] = [];
    const visited: { [key: string]: number } = {};

    for (const part of parts) {
        if (part.filename === undefined) {
            const key = part.name || 'undefined';
            const value = parseBody(part).data;

            visited[key] = visited[key] || 0;
            visited[key]++;
            if (visited[key] === 2) body[key] = [body[key]];
    
            if (visited[key] > 1) {
                body[key].push(value);
            } else {
                body[key] = value;
            }
        } else {
            files.push(part);
        }
    }

    return [body, files];
}
