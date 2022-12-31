export const WILD = '[^: *]*';
export const PARA = '[^/: *]+';

export default function createRegex (parts: string[], forceWild = false): RegExp {
    return new RegExp('^/' + getConverted(parts, forceWild) + '$', 'i');
}

function getConverted (parts: string[], forceWild: boolean): string {
    const wildIndex = getWildIndex(parts, forceWild);
    const hasWild = wildIndex > -1;
    const trimmed = hasWild ? parts.slice(0, wildIndex) : parts;
    const converted = trimmed.map(replaceParam).join('/');
    return hasWild ? converted + WILD : converted;
}

function getWildIndex (parts: string[], forceWild: boolean): number {
    const wildIndex = parts.indexOf('**');
    return wildIndex > -1 || !forceWild ? wildIndex : parts.length;
}

function replaceParam (part: string): string {
    return part.startsWith(':') ? PARA : part;
}
