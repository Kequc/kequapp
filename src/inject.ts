import { ClientRequest, ServerResponse } from 'http';
import MockReq from 'mock-req';
import MockRes from 'mock-res';
import createGetResponse, { IGetResponse } from './body/create-get-response';
import { IKequapp } from './main';
import { ConfigInput, validateConfig } from './utils/setup-config';


type OptionsInput = {
    override?: ConfigInput;
    method?: string;
    url?: string;
    headers?: { [k: string]: string };
    rawHeaders?: { [k: string]: string };
    search?: string;
    body?: unknown;
};
type InjectResponse = {
    req: ClientRequest;
    res: ServerResponse;
    getResponse: IGetResponse;
};


function inject (app: IKequapp, options: OptionsInput): InjectResponse {
    if (options.override) validateConfig(options.override);

    const _options = { ...options };

    if (_options.search) {
        _options.search = new URLSearchParams(_options.search).toString();
    }

    const _override = options.override;
    delete _options.override;
    const _end = options.body;
    delete _options.body;

    const req = new MockReq(_options);
    const res = new MockRes();

    app(req, res, _override);

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
