import { v4 as uuidv4 } from "uuid";

export const getUUID = (): string => uuidv4();

const KEY = "__gb_br_sid__";

//TODO: não sei como lidar com isso ainda no Client
export const getSessionUUID = (
    // eslint-disable-next-line no-undef
    storage: { getItem: Function; setItem: Function } = window.sessionStorage
): string =>
    storage.getItem(KEY) ||
    ((): string => {
        const _sid = getUUID();
        storage.setItem(KEY, _sid);
        return _sid;
    })();
