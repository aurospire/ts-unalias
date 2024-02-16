import nodefs from 'fs';
import ts from 'typescript';

/**
 * Retrieves TypeScript compiler options from a tsconfig file.
 *
 * @param searchPath - The directory path to search for the tsconfig file. Defaults to the current working directory.
 * @param configName - The name of the tsconfig file to search for. Defaults to "tsconfig.json".
 * @returns TypeScript compiler options parsed from the tsconfig file.
 * @throws {Error} - Throws an error if no tsconfig file is found.
 */
export const getTsCompilerOptions = (searchPath?: string, configName?: string): ts.CompilerOptions => {
    
    const tsConfigPath = ts.findConfigFile(searchPath ?? process.cwd(), (path) => nodefs.existsSync(path), configName);

    if (!tsConfigPath) throw new Error('No tsconfig found');

    const tsConfigFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    return ts.parseJsonConfigFileContent(tsConfigFile.config, ts.sys, './').options || {};
};
