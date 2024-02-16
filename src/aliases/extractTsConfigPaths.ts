import ts from 'typescript';

/**
 * Represents a path configuration in a TypeScript tsconfig file.
 */
export type TsConfigPath = {
    /** The name of the path. */
    name: string;
    /** The base URL for resolving non-relative module names. */
    baseUrl?: string;
    /** An array of path mappings. */
    to: string[];
};

/**
 * Extracts path configurations from TypeScript compiler options.
 * @param options - The TypeScript compiler options object.
 * @param onItem - Optional callback function called for each path configuration extracted.
 * @returns An array of TsConfigPath objects representing the extracted path configurations.
 */
export const extractTsConfigPaths = (
    options: ts.CompilerOptions,
    onItem?: (item: TsConfigPath) => void
): TsConfigPath[] => {
    const baseUrl = options.baseUrl;

    const paths = options.paths ?? {};


    return Object.entries(paths).map(([name, to]) => {
        const result = {
            name,
            baseUrl,
            to: to.length ? to : ['']
        };
    
        onItem?.(result);

        return result;
    });
};
