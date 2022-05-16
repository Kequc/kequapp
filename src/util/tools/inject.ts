import createGetResponse from '../../body/create-get-response';
import { IKequapp, TInject, TReqOptions } from '../../types';
import { FakeReq, FakeRes } from '../fake-http';

export default function inject (app: IKequapp, options: TReqOptions): TInject {
    const req = new FakeReq(options) as any;
    const res = new FakeRes() as any;

    app(req, res);

    return {
        req,
        res,
        getResponse: createGetResponse(res)
    };
}
