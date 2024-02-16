import nodepath from 'path';
import { TsConfigPath } from './extractTsConfigPaths';

/**
 * Represents a path alias extracted from TypeScript path mappings.
 */
export type PathAlias = {
    /** The name of the alias. */
    name: string;
    /** The full alias path. */
    full: string;
    /** The target path for the alias. */
    to: string;
    /** Regular expression pattern for matching the alias path. */
    regex: RegExp;
};

/**
 * Extracts path aliases from TypeScript path mappings.
 * @param paths - An array of TsConfigPath objects representing TypeScript path mappings.
 * @param onItem - Optional callback function called for each path alias extracted.
 * @returns An array of PathAlias objects representing the extracted path aliases.
 */
export const extractPathAliases = (paths: TsConfigPath[], onItem?: (item: PathAlias) => void): PathAlias[] => {
    return paths.map(path => {
        // Extract alias name and folder from path name
        const [, name, folder] = path.name.match(/^(.+?)(\/\*)?$/) ?? [];

        // Construct full path to target
        const to = path.baseUrl ? nodepath.join(path.baseUrl, path.to[0]) : path.to[0];

        // Extract target name from full path
        const [, toName] = (to).match(/^(.+?)(\/\*)?$/) ?? [];

        // Construct regular expression pattern for matching the alias path
        const regex = folder ? new RegExp(`^${name}\/(.*)$`) : new RegExp(`^${name}$`);
        
        const result = {
            name,
            full: name,
            to: toName,
            regex
        };

        onItem?.(result);

        return result;
    });
};
