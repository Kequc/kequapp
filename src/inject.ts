import { IncomingMessage, ServerResponse } from 'http';
import { Transform } from 'stream';
import createGetResponse from './body/create-get-response';
import { IGetResponse, IKequapp, TInjectOptions } from './types';
import FakeIncomingMessage from './util/mock/fake-req';
import FakeServerResponse from './util/mock/fake-res';

type TInject = {
    req: IncomingMessage & Transform;
    res: ServerResponse & Transform;
    getResponse: IGetResponse;
};

export function inject (app: IKequapp, options: Partial<TInjectOptions>): TInject {
    const req = new FakeIncomingMessage(options);
    const res = new FakeServerResponse();

    app(req, res);

    return {
        req,
        res,
        getResponse: createGetResponse(res)
    };
}
