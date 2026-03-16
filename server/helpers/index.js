// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => ({
  route(name, params) {
    // Fastify's reverse helper (path-to-regexp) expects route params to be strings.
    // Support passing a single id directly (number or string) for convenience.
    const normalizedParams = (() => {
      if (params === undefined) {
        return undefined;
      }

      if (params && typeof params === 'object' && !Array.isArray(params)) {
        return Object.fromEntries(
          Object.entries(params).map(([key, value]) => [
            key,
            value == null ? value : String(value),
          ]),
        );
      }

      return { id: String(params) };
    })();

    return app.reverse(name, normalizedParams);
  },
  t(key) {
    return i18next.t(key);
  },
  _,
  getAlertClass(type) {
    switch (type) {
    // case 'failure':
    //   return 'danger';
    case 'error':
      return 'danger';
    case 'success':
      return 'success';
    case 'info':
      return 'info';
    default:
      throw new Error(`Unknown flash type: '${type}'`);
    }
  },
  formatDate(str) {
    const date = new Date(str);
    return date.toLocaleString();
  },
});
