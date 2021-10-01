class Header {
    parts: string[];

    constructor (raw: string | undefined) {
        this.parts = (raw || '').split(';');
    }

    sanitize () {
        return this.parts[0].toLowerCase().trim();
    }

    values () {
        const result: DataObject = {};
        for (const part of this.parts.slice(1)) {
            const [key, ...values] = part.split('=');
            result[key.toLowerCase().trim()] = values.join('=').trim() || null;
        }
        return result;
    }
}

export default Header;
