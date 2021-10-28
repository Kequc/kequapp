import { BundleParams } from '../main';

export function comparePathnames (srcPathname: string, reqPathname: string): boolean {
    const srcParts = getParts(srcPathname);
    const reqParts = getParts(reqPathname);

    for (let i = 0; i < srcParts.length; i++) {
        if (srcParts[i] === '**') return true;
        if (srcParts[i] === '*') continue;
        if (srcParts[i][0] === ':') continue;
        if (srcParts[i] === reqParts[i]) continue;
        return false;
    }

    return srcParts.length === reqParts.length;
}

export function extractParams (srcPathname: string, reqPathname: string): BundleParams {
    const params: BundleParams = {};
    const srcParts = getParts(srcPathname);
    const reqParts = getParts(reqPathname);

    for (let i = 0; i < srcParts.length; i++) {
        if (srcParts[i] === '**') {
            params['**'] = reqParts.slice(i);
            return params;
        }

        if (srcParts[i] === '*') {
            params['*'] = params['*'] || [];
            params['*'].push(reqParts[i]);
        }

        if (srcParts[i][0] === ':') {
            params[srcParts[i].substr(1)] = reqParts[i];
        }
    }

    return params;
}

function getParts (pathname: string): string[] {
    return pathname.split('/').filter(part => !!part);
}
