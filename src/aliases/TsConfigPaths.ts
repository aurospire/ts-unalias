import nodefs from 'fs';
import ts from 'typescript';
import { PathAlias } from './PathAlias';

export type TsConfigPaths = Record<string, string[]>;

export const getTsConfigPaths = (searchPath: string = process.cwd(), configPath?: string): TsConfigPaths => {
    const tsConfigPath = ts.findConfigFile(searchPath, (path) => { return nodefs.existsSync(path); }, configPath);

    if (!tsConfigPath) throw new Error('No tsconfig found');

    const tsConfigFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    const compilerOptions = ts.parseJsonConfigFileContent(tsConfigFile.config, ts.sys, './').options;

    return compilerOptions.paths || {};
};

export const parseTsConfigPaths = (paths: TsConfigPaths): PathAlias[] => {
    return Object.entries(paths).map(([alias, to]) => {
        const [, name, folder] = alias.match(/^(.+?)(\/\*)?$/) ?? [];

        const [, toName] = (to[0]).match(/^(.+?)(\/\*)?$/) ?? [];

        return {
            name,
            full: alias,
            to: toName,
            regex: folder ? new RegExp(`^${name}\/(.*)$`) : new RegExp(`^${name}$`)
        } as PathAlias;
    });
};