/**
 * API unificada Chrome / Firefox.
 * Firefox expõe `browser` (Promises); Chrome usa `chrome` (callbacks).
 */
(function (global) {
  const api = typeof global.browser !== "undefined" ? global.browser : global.chrome;

  function promisify(fn, context) {
    return (...args) =>
      new Promise((resolve, reject) => {
        fn.call(context, ...args, (result) => {
          const err = global.chrome?.runtime?.lastError;
          if (err) {
            reject(new Error(err.message));
            return;
          }
          resolve(result);
        });
      });
  }

  function asPromise(method, context, args) {
    const result = method.apply(context, args);
    return result && typeof result.then === "function"
      ? result
      : promisify(method, context)(...args);
  }

  const storageLocal = api.storage.local;
  const dnr = api.declarativeNetRequest;

  global.ext = {
    storage: {
      get: (keys) => asPromise(storageLocal.get, storageLocal, [keys]),
      set: (items) => asPromise(storageLocal.set, storageLocal, [items]),
    },
    runtime: {
      getURL: (path) => api.runtime.getURL(path),
      onInstalled: api.runtime.onInstalled,
      onStartup: api.runtime.onStartup,
    },
    declarativeNetRequest: {
      updateDynamicRules: (options) =>
        asPromise(dnr.updateDynamicRules, dnr, [options]),
      getDynamicRules: () => asPromise(dnr.getDynamicRules, dnr, []),
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : self);
