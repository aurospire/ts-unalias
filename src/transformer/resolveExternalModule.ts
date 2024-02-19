import nodepath from 'path';
import { PathAlias } from '../aliases';

/**
 * Represents the direction of an external module resolution.
 */
export type ExternalModuleDirection = 'import' | 'export';

/**
 * Represents the type of an external module.
 */
export type ExternalModuleType = 'module' | 'path' | 'alias';

/**
 * Represents the result of resolving an external module.
 */
export type ExternalModule = {
    /** The direction of the external module resolution. */
    direction: ExternalModuleDirection;
    /** The type of the external module. */
    type: ExternalModuleType;
    /** The absolute path of the file from which the resolution is performed. */
    from: string;
    /** The resolved target of the external module. */
    to: string;
    /** The original target path. */
    originalTo: string;
    /** The resolved absolute path of the target (if an alias). */
    fullToPath?: string;
    /** The relative path from the source file to the resolved target file (if an alias). */
    relativeToPath?: string;
};

/**
 * Resolves an external module path.
 * @param direction - The direction of the external module resolution ('import' or 'export').
 * @param fromPath - The absolute path of the file from which the resolution is performed.
 * @param toModule - The target path of the external module.
 * @param aliases - An array of path aliases used for resolving alias targets.
 * @returns The resolved external module object.
 */
export const resolveExternalModule = (
    direction: ExternalModuleDirection,
    fromPath: string,
    toModule: string,
    aliases: PathAlias[]
): ExternalModule => {
    // Iterate through each alias to check if the target module matches any alias regex
    for (const alias of aliases) {
        const match = toModule.match(alias.regex);

        // If a match is found
        if (match) {
            const suffix = match[1];

            // Get the directory of the source file
            const base = nodepath.parse(fromPath).dir;

            // Resolve the full absolute path of the source file
            const fullFromPath: string = nodepath.resolve(base);

            // Resolve the full absolute path of the target file (with suffix if provided)
            const fullToPath: string = suffix ? nodepath.resolve(alias.to, suffix) : nodepath.resolve(alias.to);

            // Calculate the relative path from the source file to the resolved target file
            let relativeToPath = nodepath.relative(nodepath.dirname(fromPath), fullToPath);

            // Ensure the relative path starts with './' if it's not in the same directory
            relativeToPath = relativeToPath.startsWith('.') ? relativeToPath : `./${relativeToPath}`;

            // Return the resolved external module object
            return {
                direction,
                type: 'alias',
                from: fullFromPath,
                to: relativeToPath,
                originalTo: toModule,
                fullToPath,
                relativeToPath
            };
        }
    }

    // If no alias matches, determine if the target module is a local path or a module
    return {
        direction,
        type: (toModule.match(/^\./) ? 'path' : 'module'),
        from: fromPath,
        to: toModule,
        originalTo: toModule
    };
};
