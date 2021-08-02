/*
 * Cookies.js - 1.2.3-grav
 * https://github.com/ScottHamper/Cookies
 *
 * With SameSite support by Grav
 *
 * This is free and unencumbered software released into the public domain.
 */

const factory = function(window) {
    if (typeof window.document !== 'object') {
        throw new Error('Cookies.js requires a `window` with a `document` object');
    }

    const Cookies = (key, value, options) => {
        return arguments.length === 1
            ? Cookies.get(key)
            : Cookies.set(key, value, options);
    };

    // Allows for setter injection in unit tests
    Cookies._document = window.document;

    // Used to ensure cookie keys do not collide with
    // built-in `Object` properties
    Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)

    Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

    Cookies.defaults = {
        path: '/',
        secure: false,
        sameSite: 'Lax'
    };

    Cookies.get = (key) => {
        if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
            Cookies._renewCache();
        }

        const value = Cookies._cache[Cookies._cacheKeyPrefix + key];

        return value === undefined ? undefined : decodeURIComponent(value);
    };

    Cookies.set = (key, value, options) => {
        options = Cookies._getExtendedOptions(options);
        options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

        Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

        return Cookies;
    };

    Cookies.expire = (key, options) => {
        return Cookies.set(key, undefined, options);
    };

    Cookies._getExtendedOptions = (options) => {
        return {
            path: options && options.path || Cookies.defaults.path,
            domain: options && options.domain || Cookies.defaults.domain,
            expires: options && options.expires || Cookies.defaults.expires,
            secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure,
            sameSite: options && options.sameSite || Cookies.defaults.sameSite
        };
    };

    Cookies._isValidDate = (date) => {
        return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
    };

    Cookies._getExpiresDate = (expires, now) => {
        now = now || new Date();

        if (typeof expires === 'number') {
            expires = expires === Infinity
                ? Cookies._maxExpireDate
                : new Date(now.getTime() + expires * 1000);
        } else if (typeof expires === 'string') {
            expires = new Date(expires);
        }

        if (expires && !Cookies._isValidDate(expires)) {
            throw new Error('`expires` parameter cannot be converted to a valid Date instance');
        }

        return expires;
    };

    Cookies._generateCookieString = (key, value, options) => {
        key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
        key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
        value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
        options = options || {};

        let cookieString = key + '=' + value;
        cookieString += options.path ? ';path=' + options.path : '';
        cookieString += options.domain ? ';domain=' + options.domain : '';
        cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
        cookieString += options.secure ? ';secure' : '';
        cookieString += options.sameSite ? ';SameSite=' + options.sameSite : '';

        return cookieString;
    };

    Cookies._getCacheFromString = (documentCookie) => {
        let cookieCache = {};
        const cookiesArray = documentCookie ? documentCookie.split('; ') : [];

        for (let i = 0; i < cookiesArray.length; i++) {
            const cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

            if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
            }
        }

        return cookieCache;
    };

    Cookies._getKeyValuePairFromCookieString = (cookieString) => {
        // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
        let separatorIndex = cookieString.indexOf('=');

        // IE omits the "=" when the cookie value is an empty string
        separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

        const key = cookieString.substr(0, separatorIndex);
        let decodedKey;
        try {
            decodedKey = decodeURIComponent(key);
        } catch (e) {
            if (console && typeof console.error === 'function') {
                console.error('Could not decode cookie with key "' + key + '"', e);
            }
        }

        return {
            key: decodedKey,
            value: cookieString.substr(separatorIndex + 1) // Defer decoding value until accessed
        };
    };

    Cookies._renewCache = () => {
        Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
        Cookies._cachedDocumentCookie = Cookies._document.cookie;
    };

    Cookies._areEnabled = () => {
        const testKey = 'cookies.js';
        const areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
        Cookies.expire(testKey);
        return areEnabled;
    };

    Cookies.enabled = Cookies._areEnabled();

    return Cookies;
};

global.Cookies = (global && typeof global.document === 'object') ? factory(global) : factory;

export default global.Cookies;
