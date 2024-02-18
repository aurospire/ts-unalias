import nodepath from 'path';
import { PathAlias } from './extractPathAliases';
import { NotifierType, resolveNotifier } from '../util';

/**
 * Represents an alias configuration for Jest.
 */
export type JestAlias = {
    /** The regex of the alias. */
    from: string;
    /** The target path for the alias. */
    to: string;
};

/**
 * Extracts JestAlias alias configurations from path aliases.
 * @param aliases - An array of PathAlias objects representing path aliases.
 * @param basePath - The base path for resolving alias targets.
 * @param onItem - Optional notifier type or function called for each Jest alias extracted.
 * @returns A record containing Jest alias configurations with alias names as keys and resolved paths as values.
 */
export const extractJestAliases = (aliases: PathAlias[], onItem?: NotifierType<JestAlias>): Record<string, string> => {
    const result: Record<string, string> = {};

    const notify = resolveNotifier(onItem);

    for (const alias of aliases) {
        const from = `^${alias.name}${alias.folder ? '/(.*)' : ''}$`;

        const to = '<rootDir>/' +  alias.to;

        const jestAlias: JestAlias = { from, to };

        notify(jestAlias);

        result[from] = to;
    }

    return result;
};
