import nodepath from 'path';
import { PathAlias, extractPathAliases } from './extractPathAliases';
import { NotifierType, resolveNotifier } from '../util';

/**
 * Represents an alias configuration for Webpack.
 */
export type WebpackAlias = {
    /** The name of the alias. */
    name: string;
    /** The target path for the alias. */
    to: string;
    /** The resolved absolute path for the alias. */
    resolved: string;
};

/**
 * Extracts Webpack alias configurations from path aliases.
 * @param aliases - An array of PathAlias objects representing path aliases.
 * @param basePath - The base path for resolving alias targets.
 * @param onItem - Optional notifier type or function called for each Webpack alias extracted.
 * @returns A record containing Webpack alias configurations with alias names as keys and resolved paths as values.
 */
export const extractWebpackAliases = (aliases: PathAlias[], basePath: string, onItem?: NotifierType<WebpackAlias>): Record<string, string> => {
    const result: Record<string, string> = {};

    const notify = resolveNotifier(onItem);

    for (const alias of aliases) {
        const name = alias.name + (alias.folder ? '' : '$');
        const to = alias.to;

        const resolved = nodepath.resolve(basePath, to);

        const webpackAlias = { name, to, resolved };

        notify(webpackAlias);

        result[name] = resolved;
    }

    return result;
};
