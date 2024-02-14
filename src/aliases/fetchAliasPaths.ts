import { Logger, defaultLogger } from "../util";
import { PathAlias } from "./PathAlias";
import { getTsConfigPathAliases } from "./getTsConfigPathAliases";
import { parseAliases } from "./parseAliases";

export const fetchAliasPaths = (log?: true | Logger<PathAlias[]>): PathAlias[] => {
    const tsAliases = getTsConfigPathAliases();

    const parsed = parseAliases(tsAliases);

    if (log === true)
        defaultLogger(parsed);
    else if (log !== undefined)
        log(parsed);

    return parsed;
};
