import nodepath from 'path';
import { PathAlias, extractPathAliases } from './extractPathAliases';

export type WebpackAlias = {
    name: string;
    to: string;
    resolved: string;
};

export const extractWebpackAliases = (aliases: PathAlias[], basePath: string, onItem?: (item: WebpackAlias) => void): Record<string, string> => {    
    const result: Record<string, string> = {};

    for (const alias of aliases) {
        const name = alias.name;

        const to = alias.to;

        const resolved = nodepath.resolve(basePath, to);

        onItem?.({ name, to, resolved });

        result[name] = resolved;
    }

    return result;
};