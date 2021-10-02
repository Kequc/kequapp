import { IncomingMessage } from 'http';
import parseBody from './parse-body';
import streamReader from './stream-reader';

import { Config } from '../../types/main';
import { JsonData, RawBodyPart } from '../../types/body-parser';

type Options = {
    multipart?: boolean;
    parse?: boolean;
};

const DEFAULT_OPTIONS = {
    multipart: false,
    parse: true
};

function buildGetBody (req: IncomingMessage, config: Config) {
    let body: RawBodyPart;

    return async function getBody (options: Options = {}): Promise<JsonData> {
        if (body === undefined) {
            body = await streamReader(req, config.maxPayloadSize);
        }

        const _options = Object.assign({}, DEFAULT_OPTIONS, options);

        if (_options.parse) {
            const parsed = parseBody(body);
            return _options.multipart ? parsed : parsed.data[0];
        }

        return _options.multipart ? body : body.data[0];
    }
}

export default buildGetBody;
