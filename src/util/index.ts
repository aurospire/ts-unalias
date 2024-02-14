import { inspect } from "util";

export type Logger<T = any> = (data: T) => void;

export const defaultLogger: Logger = (data: any) => { console.log(inspect(data, { depth: null, colors: true })); };