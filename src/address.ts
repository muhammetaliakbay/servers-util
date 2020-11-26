const domainRule = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;
export type Domain = string[];
export function parseDomain(
    domain: string, config?: {
        acceptLocalhost?: boolean
    }
): false | Domain {
    if (domain === 'localhost') {
        if (config?.acceptLocalhost) {
            return ['localhost'];
        } else {
            return false;
        }
    }
    else if (domainRule.test(domain)) {
        return domain.split('.') as Domain;
    } else {
        return false;
    }
}
