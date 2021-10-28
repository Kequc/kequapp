function headerAttributes (header = ''): { [key: string]: string } {
    const result: { [key: string]: string } = {};

    let inQuotes = false;
    let isAssignment = false;
    let key = '';
    let value = '';

    function reset () {
        inQuotes = false;
        isAssignment = false;
        key = '';
        value = '';
    }

    for (let i = 0; i < header.length; i++) {
        if (header[i] === '"') {
            inQuotes = !inQuotes;
            if (!inQuotes && isAssignment) {
                result[key] = value;
                reset();
            }
            continue;
        }

        if (/[?:;|, ]/.test(header[i]) && !inQuotes) {
            if (isAssignment) result[key] = value;
            reset();
            continue;
        }

        if (header[i] === '=' && !inQuotes) {
            isAssignment = true;
            continue;
        }

        if (isAssignment) {
            value += header[i];
        } else {
            key += header[i];
        }
    }

    if (isAssignment && !inQuotes) {
        result[key] = value;
    }

    return result;
}

export default headerAttributes;
