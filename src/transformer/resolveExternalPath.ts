import nodepath from 'path';

import { PathAlias } from '../aliases';
import { ExternalPath } from './ExternalPath';

const resolvePath = (aliased: boolean, fromPath: string, toPath: string, suffix?: string): ExternalPath => {
    const base = nodepath.parse(fromPath).dir;

    const fullFromPath: string = nodepath.resolve(base);

    const fullToPath: string = aliased
        ? suffix ? nodepath.resolve(toPath, suffix) : nodepath.resolve(toPath)
        : (toPath.match(/^([\.]|[^\/\\])/) ? nodepath.resolve(base, toPath) : toPath);

    let relativeToPath = nodepath.relative(nodepath.dirname(fromPath), fullToPath);

    relativeToPath = relativeToPath.startsWith('.') ? relativeToPath : `./${relativeToPath}`;

    return {
        aliased,
        fromPath: fullFromPath,
        toPath,
        fullToPath,
        relativeToPath
    };
};

export const resolveExternalPath = (fromPath: string, toPath: string, aliases: PathAlias[]): ExternalPath => {
    for (const alias of aliases) {
        const match = toPath.match(alias.regex);

        if (match) {
            const suffix = match[1];
            return resolvePath(true, fromPath, alias.to, suffix);
        }
    };

    return resolvePath(false, fromPath, toPath);
};