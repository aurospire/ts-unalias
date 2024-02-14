import { PathAlias } from "./PathAlias";

export const parseAliases = (aliases: Record<string, string[]>): PathAlias[] => {
    return Object.entries(aliases).map(([alias, to]) => {
        const [, name, folder] = alias.match(/^(.+?)(\/\*)?$/) ?? [];

        const [, toName] = (to[0]).match(/^(.+?)(\/\*)?$/) ?? [];

        return {
            name: alias,
            to: toName,
            regex: folder ? new RegExp(`^${name}\/(.*)$`) : new RegExp(`^${name}$`)
        } as PathAlias;
    });
};