import nodepath from 'path';
import { PathAlias } from '../aliases';

/**
 * Represents an external path resolution result.
 */
export type ExternalPath = {
    /** The type of the external path (import/export). */
    type?: 'import' | 'export';
    /** Indicates whether the path is aliased. */
    aliased: boolean;
    /** The absolute path of the file from which the resolution is performed. */
    fromPath: string;
    /** The original target path. */
    toPath: string;
    /** The resolved absolute path of the target. */
    fullToPath: string;
    /** The relative path from the source file to the resolved target file. */
    relativeToPath: string;
};

/**
 * Resolves an external path using provided path aliases.
 * @param fromPath - The absolute path of the source file.
 * @param toPath - The target path to resolve.
 * @param aliases - An array of path aliases used for resolution.
 * @returns An ExternalPath object representing the resolved path.
 */
export const resolveExternalPath = (fromPath: string, toPath: string, aliases: PathAlias[]): ExternalPath => {
    for (const alias of aliases) {
        const match = toPath.match(alias.regex);

        if (match) {
            const suffix = match[1];

            return resolvePath(true, fromPath, alias.to, suffix);
        }
    }

    return resolvePath(false, fromPath, toPath);
};

const resolvePath = (aliased: boolean, fromPath: string, toPath: string, suffix?: string): ExternalPath => {
    // Extract the directory of the source file
    const base = nodepath.parse(fromPath).dir;

    // Resolve the absolute path of the source file
    const fullFromPath: string = nodepath.resolve(base);

    // Resolve the full absolute path of the target file
    const fullToPath: string = aliased
        ? suffix ? nodepath.resolve(toPath, suffix) : nodepath.resolve(toPath)
        : (toPath.match(/^([\.]|[^\/\\])/) ? nodepath.resolve(base, toPath) : toPath);

    // Calculate the relative path from the source file to the target file
    let relativeToPath = nodepath.relative(nodepath.dirname(fromPath), fullToPath);

    // Ensure the relative path starts with './' if necessary
    relativeToPath = relativeToPath.startsWith('.') ? relativeToPath : `./${relativeToPath}`;

    return {
        aliased,
        fromPath: fullFromPath,
        toPath,
        fullToPath,
        relativeToPath
    };
};
