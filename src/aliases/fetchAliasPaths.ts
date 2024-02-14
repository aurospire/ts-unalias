import { Logger, consoleLogger, lineLogger } from "../util";
import { PathAlias } from "./PathAlias";
import { getTsConfigPathAliases } from "./getTsConfigPathAliases";
import { parseAliases } from "./parseAliases";

export const fetchAliasPaths = (log?: boolean | Logger<PathAlias[]>): PathAlias[] => {
    const tsAliases = getTsConfigPathAliases();

    const parsed = parseAliases(tsAliases);

    if (log === true)
        lineLogger(consoleLogger('ts-unalias:alias'))(parsed);
    else if (log !== false && log !== undefined)
        log(parsed);

    return parsed;
};
