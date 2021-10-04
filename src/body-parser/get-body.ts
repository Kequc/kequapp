import { IncomingMessage } from 'http';
import multipart from './multipart';
import parseBody from './parse-body';
import streamReader from './stream-reader';
import { headerAttributes } from '../util/sanitize';

import { BodyJson, BodyPart } from '../../types/body-parser';
import { IGetBody } from '../../types/main';

export enum BodyFormat {
    PARSED,
    MULTIPART,
    RAW,
    RAW_MULTIPART,
    PARSED_MULTIPART
}

function getBody (req: IncomingMessage, maxPayloadSize?: number): IGetBody {
    let _body: BodyPart;

    return async function (format) {
        if (_body === undefined) {
            _body = await streamReader(req, maxPayloadSize);
        }

        switch (format) {
        case BodyFormat.MULTIPART:
            return reduceMultipart(multipart(_body.data, _body.headers.contentType));
        case BodyFormat.RAW:
            return { ..._body };
        case BodyFormat.RAW_MULTIPART:
            return {
                ..._body,
                parts: multipart(_body.data, _body.headers.contentType)
            };
        case BodyFormat.PARSED_MULTIPART:
            return {
                ..._body,
                parts: multipart(_body.data, _body.headers.contentType).map(parseBody)
            };
        default:
            return parseBody(_body).data;
        }
    }
}

export default getBody;

function reduceMultipart (parts: BodyPart[]): [BodyJson, BodyPart[]] {
    const body: BodyJson = {};
    const visited: { [key: string]: number } = {};
    const files: BodyPart[] = [];

    for (const part of parts) {
        if (part.filename === undefined) {
            const key = part.name || 'undefined';
            visited[key] = visited[key] || 0;
            visited[key]++;
            if (visited[key] === 2) body[key] = [body[key]];
    
            if (visited[key] > 1) {
                body[key].push(parseBody(part).data);
            } else {
                body[key] = parseBody(part).data;
            }
        } else {
            files.push(part);
        }
    }

    return [body, files];
}
