import nodepath from 'path';

import { PathAlias } from './PathAlias';
import { inspect } from 'util';

export const resolveAlias = (importPath: string, filePath: string, aliases: PathAlias[]): string => {
    for (const alias of aliases) {
        const match = importPath.match(alias.regex);

        if (match) {
            const suffix = match[1];

            const realImport = suffix ? nodepath.resolve(alias.to, suffix) : alias.to;

            const relativePath = nodepath.relative(nodepath.dirname(filePath), realImport);

            const relativeImport = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;

            console.log(inspect({
                importPath,
                filePath,
                alias,
                match,
                realImport,
                relativePath
            }));

            return relativeImport;
        }
    };

    return importPath;
};