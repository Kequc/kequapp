import { IncomingMessage, ServerResponse } from 'http';
import MockReq from 'mock-req';
import MockRes from 'mock-res';
import { Transform } from 'stream';
import createGetResponse from './body/create-get-response';
import { IGetResponse, IKequapp, TParams } from './types';

type TInjectOptions = {
    method: string;
    url: string;
    headers: TParams;
    rawHeaders: TParams;
    search: string;
    body: unknown;
};

type TInject = {
    req: IncomingMessage & Transform;
    res: ServerResponse & Transform;
    getResponse: IGetResponse;
};

export function inject (app: IKequapp, options: Partial<TInjectOptions>): TInject {
    const _options = { ...options };

    if (_options.search) {
        _options.search = new URLSearchParams(_options.search).toString();
    }

    const body = options.body;
    delete _options.body;

    const req = new MockReq(_options);
    const res = new MockRes();

    app(req, res);

    if (body !== null && !req.writableEnded) {
        req.end(body);
    }

    return {
        req,
        res,
        getResponse: createGetResponse(res)
    };
}
