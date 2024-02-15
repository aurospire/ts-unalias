import { inspect } from "util";

export type Logger<T = any> = (data: T) => void;

export const silentLogger = <T = any>(from?: string): Logger<T> => (data: T) => { };

export const consoleLogger = <T = any>(from?: string): Logger<T> => (data: T) => {
    const inspected = inspect(data, { depth: null, colors: true });

    console.log(from ? `[${from}]:` : '', inspected);
};

export const lineLogger = <T = any>(logger: Logger<T>): Logger<T[]> => (data: T[]) => {
    for (const item of data)
        logger(item);
};