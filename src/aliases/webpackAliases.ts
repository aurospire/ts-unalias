import nodepath from 'path';

import { Logger, consoleLogger, silentLogger } from "../util";
import { fetchAliasPaths } from "./fetchAliasPaths";

export type WebpackAlias = {
    name: string;
    to: string;
    resolved: string;
};

export const webpackAliases = (basePath: string, { searchPath, configPath, log }: {
    searchPath?: string;
    configPath?: string;
    log?: boolean | string | Logger<WebpackAlias>;
} = {}): Record<string, string> => {
    const logger = log === true
        ? consoleLogger('unalias.webpack:alias')
        : typeof log === 'string'
            ? consoleLogger(log)
            : typeof log === 'function'
                ? log
                : silentLogger();

    const paths = fetchAliasPaths({ searchPath, configPath });

    const result: Record<string, string> = {};

    for (const path of paths) {
        const name = path.name;

        const to = path.to;

        const resolved = nodepath.resolve(basePath, to);

        logger({ name, to, resolved });

        result[name] = resolved;
    }

    return result;
};