/** biome-ignore-all lint/suspicious/noExplicitAny: too many possibilities */
import type { RequestListener } from 'node:http';
import createGetResponse from '../../body/create-get-response.ts';
import type { TInject, TReqOptions } from '../../types.ts';
import { FakeReq, FakeRes } from '../../util/fake-http.ts';

export default function inject(
    app: RequestListener,
    options: TReqOptions,
): TInject {
    const req = new FakeReq(options) as any;
    const res = new FakeRes() as any;

    app(req, res);

    return {
        req,
        res,
        getResponse: createGetResponse(res),
    };
}
