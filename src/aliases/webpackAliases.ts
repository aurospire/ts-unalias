import { PathAlias, extractPathAliases } from "./extractPathAliases";
import { TsConfigPath, extractTsConfigPaths } from "./extractTsConfigPaths";
import { WebpackAlias, extractWebpackAliases } from "./extractWebpackAliases";
import { getTsCompilerOptions } from "./getTsCompilerOptions";

export type WebpackAliasesOptions = {
    searchPath?: string,
    configName?: string,
    onTsPath?: (item: TsConfigPath) => void;
    onPathAlias?: (item: PathAlias) => void;
    onWebpackAlias?: (item: WebpackAlias) => void;
};


export const webpackAliases = (basePath: string, options?: WebpackAliasesOptions) => {
    const tsConfig = getTsCompilerOptions(options?.searchPath, options?.configName);

    const tsPaths = extractTsConfigPaths(tsConfig, options?.onTsPath);

    const pathAliases = extractPathAliases(tsPaths, options?.onPathAlias);

    const webpackAliases = extractWebpackAliases(pathAliases, basePath, options?.onWebpackAlias);

    return webpackAliases;
};