import { IncomingMessage } from 'http';
import { parseBody, parseMultipart } from './parse-body';
import streamReader from './stream-reader';

import { Config } from '../../types/main';
import { BodyOptions, BodyPart } from '../../types/body-parser';

const DEFAULT_OPTIONS = {
    full: false,
    parse: true
};

function buildGetBody (req: IncomingMessage, config: Config) {
    let body: BodyPart;

    return async function getBody (options?: BodyOptions): Promise<any> {
        if (body === undefined) {
            const raw = await streamReader(req, config.maxPayloadSize);
            body = parseMultipart(raw);
        }

        const _options = Object.assign({}, DEFAULT_OPTIONS, options);

        if (_options.parse) {
            const result = parseBody(body);
            return _options.full ? result : result.data[0];
        }

        return _options.full ? body : body.data[0];
    }
}

export default buildGetBody;
