export const getUUID = (): string =>
  `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (a: string): string =>
    (+a ^ ((Math.random() * 16) >> (+a / 4))).toString(16)
  );

const KEY = "__gb_br_sid__";

export const getSessionUUID = (
  storage: { getItem: Function; setItem: Function } = global.sessionStorage
): string =>
  storage.getItem(KEY) ||
  ((): string => {
    const _sid = getUUID();
    storage.setItem(KEY, _sid);
    return _sid;
  })();
