import { Logger, consoleLogger, lineLogger } from "../util";
import { PathAlias } from "./PathAlias";
import { getTsConfigPaths, parseTsConfigPaths } from "./TsConfigPaths";

export const fetchAliasPaths = ({ searchPath, configPath, log }: {
    searchPath?: string;
    configPath?: string;
    log?: boolean | string | Logger<PathAlias[]>;
} = {}): PathAlias[] => {
    const tsAliases = getTsConfigPaths(searchPath, configPath);

    const parsed = parseTsConfigPaths(tsAliases);

    if (log === true)
        lineLogger(consoleLogger())(parsed);
    else if (typeof log === 'string')
        lineLogger(consoleLogger(log))(parsed);
    else if (log !== false && log !== undefined)
        log(parsed);

    return parsed;
};
