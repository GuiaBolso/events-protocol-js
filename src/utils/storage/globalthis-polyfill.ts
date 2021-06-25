/* eslint-disable @typescript-eslint/ban-ts-ignore */
(function() {
    if (typeof globalThis === "object") return;
    // @ts-ignore
    Object.prototype.__defineGetter__("__alloc__", function() {
        // @ts-ignore
        return this;
    });
    // @ts-ignore
    // eslint-disable-next-line no-undef
    __alloc__.globalThis = __alloc__;
    // @ts-ignore
    delete Object.prototype.__alloc__;
})();
