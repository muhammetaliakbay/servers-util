export function headers(h: string | string[] | undefined): string[] {
    return h == null ? [] : typeof h === 'string' ? [h] : h;
}
export function header(h: string | string[] | undefined): string | undefined {
    return headers(h)[0];
}

export function rawHeaders(rawHeaders: string[], lookFor: string): string[] {
    lookFor = lookFor.toLocaleLowerCase('en');
    return rawHeaders.map(
        (val, index, arr) => {
            if (index % 2 === 0) {
                return null as any;
            } else {
                const name = arr[index-1].trim().toLocaleLowerCase('en');
                return [name, val];
            }
        }
    ).filter(val => val != null).filter(([name]) => name === lookFor).map(([name, value]) => value);
}

export function rawHeader(rawHeaders_: string[], lookFor: string): string | undefined {
    return rawHeaders(rawHeaders_, lookFor)[0];
}
