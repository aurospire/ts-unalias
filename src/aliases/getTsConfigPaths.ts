import nodefs from 'fs';
import nodepath from 'path';
import ts from 'typescript';
import { PathAlias } from './PathAlias';
import { TsConfigPath } from "./TsConfigPath";

export const getTsConfigPaths = (searchPath: string = process.cwd(), configPath?: string): TsConfigPath[] => {
    const tsConfigPath = ts.findConfigFile(searchPath, (path) => { return nodefs.existsSync(path); }, configPath);

    if (!tsConfigPath) throw new Error('No tsconfig found');

    const tsConfigFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    const compilerOptions = ts.parseJsonConfigFileContent(tsConfigFile.config, ts.sys, './').options;

    const baseUrl = compilerOptions.baseUrl;

    const paths = compilerOptions.paths ?? {};

    return Object.entries(paths).map(([name, to]) => {
        const result = {
            name,
            baseUrl,
            to: to.length ? to : ['']
        };
        return result;
    });
};

export const parseTsConfigPaths = (paths: TsConfigPath[]): PathAlias[] => {
    return paths.map(path => {
        const [, name, folder] = path.name.match(/^(.+?)(\/\*)?$/) ?? [];

        const to = path.baseUrl ? nodepath.join(path.baseUrl, path.to[0]) : path.to[0];

        const [, toName] = (to).match(/^(.+?)(\/\*)?$/) ?? [];

        return {
            name,
            full: name,
            to: toName,
            regex: folder ? new RegExp(`^${name}\/(.*)$`) : new RegExp(`^${name}$`)
        } as PathAlias;
    });
};