import MockReq from 'mock-req';
import MockRes from 'mock-res';
import createGetResponse from './body/create-get-response';
import { IKequapp } from './main';


type TOptionsInput = {
    override?: TConfigInput;
    method?: string;
    url?: string;
    headers?: { [k: string]: string };
    rawHeaders?: { [k: string]: string };
    search?: string;
    body?: unknown;
};

type TInjectResponse = {
    req: TReq;
    res: TRes;
    getResponse: IGetResponse;
};


function inject (app: IKequapp, options: TOptionsInput): TInjectResponse {
    const _options = { ...options };

    if (_options.search) {
        _options.search = new URLSearchParams(_options.search).toString();
    }

    const override = options.override;
    const body = options.body;

    delete _options.override;
    delete _options.body;

    const req = new MockReq(_options);
    const res = new MockRes();

    app(req, res, override);

    if (body !== null && !req.writableEnded) {
        req.end(body);
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
