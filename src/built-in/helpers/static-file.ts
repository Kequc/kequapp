import createRoute from '../../router/modules/create-route';
import { IAddable, TPathname } from '../../types';
import sendFile from './send-file';

export default function staticFile (url: TPathname, asset: TPathname, mime?: string): IAddable {
    return createRoute(url, async ({ res }) => {
        await sendFile(res, asset, mime);
    });
}
