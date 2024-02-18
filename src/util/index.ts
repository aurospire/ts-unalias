import { inspect } from "util";

/**
 * Represents a function that notifies or logs information about an item.
 * @typeparam T - The type of the item to be notified about.
 */
export type Notifier<T> = (item: T) => void;

/**
 * Represents the types of notifiers that can be used.
 * - `false` or `undefined`: Ignored
 * - `true`: Logs the item using `console.log`.
 * - `string`: Logs the item after replacing placeholders with item details.
 * - `Notifier<T>`: Custom notifier function to be provided by the user.
 * @typeparam T - The type of the item to be notified about.
 */
export type NotifierType<T> = boolean | string | Notifier<T>;

/**
 * Resolves the notifier based on the provided input.
 * @typeparam T - The type of the item to be notified about.
 * @param from - The input notifier type or function.
 * @returns A notifier function based on the resolved notifier type.
 */
export const resolveNotifier = <T = any>(from?: NotifierType<T>): Notifier<T> => {
    if (typeof from === 'function')
        return from;
    else if (from === true)
        return (item: T) => console.log(inspect(item, { depth: null, colors: true }));
    else if (typeof from === 'string')
        return (item: T) => console.log(from.replace('${item}', inspect(item, { depth: null, colors: true })));
    else
        return () => { };
};
