import nodepath from 'path';
import ts from 'typescript';

import { TsConfigPathAliases } from "./TsConfigPathAlias";

export const getTsConfigPathAliases = (): TsConfigPathAliases => {
    const tsConfigPath = nodepath.resolve(process.cwd(), 'tsconfig.json');

    const tsConfigFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    const compilerOptions = ts.parseJsonConfigFileContent(tsConfigFile.config, ts.sys, './').options;

    return compilerOptions.paths || {};
};
