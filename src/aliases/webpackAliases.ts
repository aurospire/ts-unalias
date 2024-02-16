import { PathAlias, extractPathAliases } from "./extractPathAliases";
import { TsConfigPath, extractTsConfigPaths } from "./extractTsConfigPaths";
import { WebpackAlias, extractWebpackAliases } from "./extractWebpackAliases";
import { getTsCompilerOptions } from "./getTsCompilerOptions";

/**
 * Options for generating Webpack aliases.
 */
export type WebpackAliasesOptions = {
    /** The directory path to search for the tsconfig file. */
    searchPath?: string,
    /** The name of the tsconfig file to search for. */
    configName?: string,
    /** Optional callback function called for each TsConfigPath extracted. */
    onTsPath?: (item: TsConfigPath) => void;
    /** Optional callback function called for each PathAlias extracted. */
    onPathAlias?: (item: PathAlias) => void;
    /** Optional callback function called for each WebpackAlias extracted. */
    onWebpackAlias?: (item: WebpackAlias) => void;
};

/**
 * Helper Function to generate Webpack alias configurations based on TypeScript path mappings.
 * @param basePath - The base path used for resolving paths.
 * @param options - Optional configuration options.
 * @returns A record containing Webpack alias configurations with alias names as keys and resolved paths as values.
 */
export const webpackAliases = (basePath: string, options?: WebpackAliasesOptions): Record<string, string> => {

    const tsConfig = getTsCompilerOptions(options?.searchPath, options?.configName);

    const tsPaths = extractTsConfigPaths(tsConfig, options?.onTsPath);

    const pathAliases = extractPathAliases(tsPaths, options?.onPathAlias);

    const webpackAliases = extractWebpackAliases(pathAliases, basePath, options?.onWebpackAlias);

    return webpackAliases;
};
