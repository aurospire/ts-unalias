import { NotifierType } from "../util";
import { PathAlias, extractPathAliases } from "./extractPathAliases";
import { TsConfigPath, extractTsConfigPaths } from "./extractTsConfigPaths";
import { JestAlias, extractJestAliases } from "./extractJestAliases";
import { getTsCompilerOptions } from "./getTsCompilerOptions";

/**
 * Options for generating Jest aliases.
 */
export type JestAliasesOptions = {
    /** The directory path to search for the tsconfig file. */
    searchPath?: string,
    /** The name of the tsconfig file to search for. */
    configName?: string,
    /** Optional notifier type or function called for each TsConfigPath extracted. */
    onTsPath?: NotifierType<TsConfigPath>;
    /** Optional notifier type or function called for each PathAlias extracted. */
    onPathAlias?: NotifierType<PathAlias>;
    /** Optional notifier type or function called for each JestAlias extracted. */
    onJestAlias?: NotifierType<JestAlias>;
};

/**
 * Helper Function to generate Jest alias configurations based on TypeScript path mappings. 
 * @param options - Optional configuration options.
 * @returns A record containing Jest alias configurations with alias names as keys and resolved paths as values.
 */
export const jestAliases = (options?: JestAliasesOptions): Record<string, string> => {

    const tsConfig = getTsCompilerOptions(options?.searchPath, options?.configName);

    const tsPaths = extractTsConfigPaths(tsConfig, options?.onTsPath);

    const pathAliases = extractPathAliases(tsPaths, options?.onPathAlias);

    const JestAliases = extractJestAliases(pathAliases, options?.onJestAlias);

    return JestAliases;
};
