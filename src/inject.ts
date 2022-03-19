import { IncomingMessage, ServerResponse } from 'http';
import { Transform } from 'stream';
import createGetResponse from './body/create-get-response';
import { IGetResponse, IKequapp, TReqOptions } from './types';
import { FakeReq, FakeRes } from './util/fake-http';

type TInject = {
    req: IncomingMessage & Transform;
    res: ServerResponse & Transform;
    getResponse: IGetResponse;
};

export function inject (app: IKequapp, options: Partial<TReqOptions>): TInject {
    const req = new FakeReq(options) as any;
    const res = new FakeRes() as any;

    app(req, res);

    return {
        req,
        res,
        getResponse: createGetResponse(res)
    };
}
