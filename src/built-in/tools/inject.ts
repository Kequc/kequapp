import { RequestListener } from 'http';
import createGetResponse from '../../body/create-get-response';
import { TInject, TReqOptions } from '../../types';
import { FakeReq, FakeRes } from '../../util/fake-http';

export default function inject (app: RequestListener, options: TReqOptions): TInject {
    const req = new FakeReq(options) as any;
    const res = new FakeRes() as any;

    app(req, res);

    return {
        req,
        res,
        getResponse: createGetResponse(res)
    };
}
