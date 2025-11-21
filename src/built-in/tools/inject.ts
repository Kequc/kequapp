/** biome-ignore-all lint/suspicious/noExplicitAny: too many possibilities */
import type {
    IncomingMessage,
    RequestListener,
    ServerResponse,
} from 'node:http';
import createGetResponse from '../../body/create-get-response.ts';
import type { TInject, TReqOptions } from '../../types.ts';
import { FakeReq, FakeRes } from '../../util/fake-http.ts';

export default function inject(
    app: RequestListener,
    options: TReqOptions,
): TInject {
    const req = new FakeReq(options);
    const res = new FakeRes();

    // Create the getResponse helper first so consumers can attach readers before
    // the application writes to the response. Schedule the app invocation
    // asynchronously to avoid races where the app writes before getResponse is used.
    const getResponse = createGetResponse(res);

    setImmediate(() => {
        // run the app in the next turn so tests can attach their readers
        app(
            req as unknown as IncomingMessage,
            res as unknown as ServerResponse,
        );
    });

    return {
        req,
        res,
        getResponse,
    };
}
