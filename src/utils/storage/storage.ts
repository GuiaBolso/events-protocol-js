/* eslint-disable @typescript-eslint/ban-ts-ignore */
function StorageImpl(instance: any) {
    const setItem = <T, K extends string>(key: K, value: T) => {
        try {
            const _value =
                typeof value === "object" &&
                value !== null &&
                value !== undefined
                    ? JSON.stringify(value)
                    : String(value);

            instance.setItem(key, _value);

            return true;
        } catch (error) {
            // TODO: Add new relic
        }
    };

    const removeItem = <T extends string>(key: T) => {
        try {
            instance.removeItem(key);

            return true;
        } catch (error) {
            // TODO: Add new relic
        }
    };

    const getItem = <T extends string>(key: T) => {
        try {
            const value = instance.getItem(key) || "";
            const local = value.match(/\[|\{/) ? JSON.parse(value) : value;

            return local;
        } catch (error) {
            // TODO: Add new relic
        }
    };

    return {
        getItem,
        removeItem,
        setItem
    };
}

const Db = new Map();

const memoryStorage = {
    getItem: (key: string) => Db.get(key),
    removeItem: (key: string) => Db.delete(key),
    setItem: (key: string, value: unknown) => Db.set(key, String(value))
};

declare global {
    interface Window {
        memoryStorage: typeof memoryStorage;
    }
}

if (globalThis) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    globalThis.__proto__.memoryStorage = memoryStorage;
}

type StorageTypes = "local" | "session" | "memory";

export function createStorage(type: StorageTypes) {
    let $Storage = undefined;

    try {
        $Storage =
            ({
                local: globalThis.localStorage,
                session: globalThis.sessionStorage,
                // @ts-ignore
                memory: globalThis.memoryStorage
            } as { [K in StorageTypes]: unknown })[type] ??
            // @ts-ignore
            globalThis.memoryStorage;
    } catch (error) {
        // @ts-ignore
        $Storage = globalThis.memoryStorage;
    }

    return StorageImpl($Storage);
}

export const local = createStorage("local");

export const session = createStorage("session");

export const memory = createStorage("memory");
