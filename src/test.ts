import { ClientRequest, ServerResponse } from 'http';
import MockReq from 'mock-req';
import MockRes from 'mock-res';
import createGetResponse, { IGetResponse } from './body-parser/get-response';
import { validateCreateAppConfig } from './util/validate';

import { ConfigInput, IKequapp } from './main';


type OptionsInput = {
    method?: string;
    url?: string;
    headers?: { [key: string]: string };
    rawHeaders?: { [key: string]: string };
    search?: string;
    body?: unknown;
};

type InjectResponse = {
    req: ClientRequest;
    res: ServerResponse;
    getResponse: IGetResponse;
};


function inject (app: IKequapp, override: ConfigInput | undefined, options: OptionsInput): InjectResponse {
    if (override) validateCreateAppConfig(override);

    const _options = { ...options };

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
        getResponse: createGetResponse(res)
    };
}

export {
    inject
};