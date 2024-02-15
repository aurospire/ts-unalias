import nodefs from 'fs';
import ts from 'typescript';


export const getCompilerOptions = ({ searchPath, configName }: { searchPath?: string; configName?: string; }) => {
    const tsConfigPath = ts.findConfigFile(searchPath ?? process.cwd(), (path) => { return nodefs.existsSync(path); }, configName);

    if (!tsConfigPath) throw new Error('No tsconfig found');

    const tsConfigFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    const compilerOptions = ts.parseJsonConfigFileContent(tsConfigFile.config, ts.sys, './').options;
};
