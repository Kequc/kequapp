import MockReq from 'mock-req';
import MockRes from 'mock-res';
import createGetResponse from './body/create-get-response';
import { IKequapp, TInject, TInjectOptions } from './types';

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
