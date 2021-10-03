import MockReq from 'mock-req';
import MockRes from 'mock-res';
import getBody from './body-parser/get-body';

import { ConfigInput, IKequserver } from '../types/main';

type OptionsInput = {
    search?: string;
    body?: string;
};

function inject (app: IKequserver, override: ConfigInput | undefined, options: OptionsInput) {
    const _options = Object.assign({}, options);

    if (_options.search) {
        _options.search = new URLSearchParams(_options.search).toString();
    }

    const _end = options.body;
    delete _options.body;

    const req = new MockReq(_options);
    const res = new MockRes();

    app(req, res, override);

    if (_end !== null && !req.writableEnded) {
        req.end(_end);
    }

    return {
        req,
        res,
        getBody: getBody(req, override?.mayPayloadSize)
    };
}

module.exports = inject;
