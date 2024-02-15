import nodepath from 'path';
import { TsConfigPath } from './extractTsConfigPaths';

export type PathAlias = {
    name: string;
    full: string;
    to: string;
    regex: RegExp;
};

export const extractPathAliases = (paths: TsConfigPath[], onItem?: (item: PathAlias) => void): PathAlias[] => {
    return paths.map(path => {
        const [, name, folder] = path.name.match(/^(.+?)(\/\*)?$/) ?? [];

        const to = path.baseUrl ? nodepath.join(path.baseUrl, path.to[0]) : path.to[0];

        const [, toName] = (to).match(/^(.+?)(\/\*)?$/) ?? [];

        const result = {
            name,
            full: name,
            to: toName,
            regex: folder ? new RegExp(`^${name}\/(.*)$`) : new RegExp(`^${name}$`)
        };

        onItem?.(result);

        return result;
    });
};
