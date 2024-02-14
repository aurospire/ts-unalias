import nodepath from 'path';

import { PathAlias } from './aliases';

export type ResolvedExternalPath = {
    aliased: boolean;    
    fromPath: string;
    toPath: string;
    fullToPath: string;
    relativeToPath: string;
};

export const resolvePath = (aliased: boolean, fromPath: string, toPath: string, suffix?: string): ResolvedExternalPath => {
    const fullToPath: string = suffix ? nodepath.resolve(toPath, suffix) : toPath;

    let relativeToPath = nodepath.relative(nodepath.dirname(fromPath), fullToPath);

    relativeToPath = relativeToPath.startsWith('.') ? relativeToPath : `./${relativeToPath}`;

    return {
        aliased,
        fromPath,
        toPath,
        fullToPath,
        relativeToPath
    };
};

export const resolveExternalPath = (fromPath: string, toPath: string, aliases: PathAlias[]): ResolvedExternalPath => {
    for (const alias of aliases) {
        const match = fromPath.match(alias.regex);

        if (match) {
            const suffix = match[1];
            return resolvePath(true, fromPath, alias.to, suffix);
        }
    };

    return resolvePath(false, fromPath, toPath);
};