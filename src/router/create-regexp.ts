import { getParts } from './util/extract';

const VALID = '0-9a-zA-Z_\\-@+.~';
export const PARA = `[${VALID}]*`;
export const WILD = `[${VALID}/]*`;

export default function createRegexp (url: string, isWild = false): RegExp {
    return new RegExp('^/' + convertUrl(url, isWild) + '$', 'i');
}

function convertUrl (url: string, isWild: boolean): string {
    const parts = getParts(url);
    const wildIndex = getWildIndex(parts, isWild);
    const hasWild = wildIndex > -1;
    const trimmed = hasWild ? parts.slice(0, wildIndex) : parts;
    const converted = trimmed.map(replaceParam).join('/');

    return hasWild ? `${converted}(?<wild>${WILD})` : converted;
}

function getWildIndex (parts: string[], isWild: boolean): number {
    const wildIndex = parts.indexOf('**');

    return (wildIndex > -1 || !isWild) ? wildIndex : parts.length;
}

function replaceParam (part: string): string {
    if (part.startsWith(':')) {
        return `(?<${part.substring(1)}>${PARA})`;
    }

    return part;
}
