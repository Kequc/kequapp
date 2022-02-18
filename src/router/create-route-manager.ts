import { getParts } from './helpers';
import Ex from '../util/ex';
import { compareRoute } from '../util/path-params';
import { getHeader, sanitizeContentType } from '../util/sanitize';

function createRouteManager (config: TConfig, branch: IBranchInstance, bundle: TBundle): IRouteManager {
    const { errorHandler, logger } = config;

    function routeManager (pathname?: string): TRoute[] {
        if (pathname) {
            const parts = getParts(pathname);
            return branch().filter(route => compareRoute(route, parts)).map(convert);
        }

        return branch().map(convert);
    }

    return routeManager;

    function convert (route: TRouteData): TRoute {
        return {
            method: route.method,
            parts: route.parts,
            lifecycle: createLifecycle(route.handles)
        };
    }

    function createLifecycle (handles: THandle[]): ILifecycle {
        async function lifecycle (): Promise<void> {
            try {
                for (const handle of handles) {
                    const payload = await handle(bundle, routeManager);

                    if (payload !== undefined || bundle.res.writableEnded) {
                        await render(payload);
                        break;
                    }
                }
            } catch (error: unknown) {
                const payload = await errorHandler(error, bundle);

                if (bundle.res.statusCode === 500) {
                    logger.error(error);
                }

                await render(payload);
            }
        }

        return lifecycle;
    }

    async function render (payload: unknown): Promise<void> {
        if (payload !== undefined && !bundle.res.writableEnded) {
            const contentType = getHeader(bundle.res, 'Content-Type');
            const renderer = findRenderer(config.renderers, contentType);
            await renderer(payload, bundle);
        }

        if (!bundle.res.writableEnded) {
            throw Ex.InternalServerError('Response not finalized', {
                pathname: bundle.url.pathname,
                method: bundle.req.method
            });
        }
    }
}

export default createRouteManager;

function findRenderer (renderers: TRenderers, contentType: string): TRenderer {
    const key = sanitizeContentType(contentType);

    if (renderers[key]) {
        return renderers[key];
    }

    throw Ex.InternalServerError('Renderer not found', {
        contentType
    });
}
