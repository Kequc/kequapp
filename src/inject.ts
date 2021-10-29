import { ClientRequest, ServerResponse } from 'http';
import MockReq from 'mock-req';
import MockRes from 'mock-res';
import createGetResponse, { IGetResponse } from './body/create-get-response';
import { IKequapp } from './main';
import { ConfigInput } from './utils/config';


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
    const _options = { ...options };

    if (_options.search) {
        _options.search = new URLSearchParams(_options.search).toString();
    }

    const override = options.override;
    const end = options.body;

    delete _options.override;
    delete _options.body;

    const req = new MockReq(_options);
    const res = new MockRes();

    app(req, res, override);

    if (end !== null && !req.writableEnded) {
        req.end(end);
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
