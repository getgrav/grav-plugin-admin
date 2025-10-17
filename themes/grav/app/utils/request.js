import { parseStatus, parseJSON, userFeedback, userFeedbackError } from './response';
import { config } from 'grav-config';

let raw;
let request = function(url, options = {}, callback = () => true) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    const silentErrors = !!options.silentErrors;
    if (options.silentErrors) {
        delete options.silentErrors;
    }

    if (options.method && options.method === 'post') {
        let data = new FormData();

        options.body = Object.assign({ 'admin-nonce': config.admin_nonce }, options.body || {});
        if (options.body && typeof options.body === 'object') {
            Object.keys(options.body).map((key) => data.append(key, options.body[key]));
        }
        options.body = data;
    }

    options = Object.assign({
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json'
        }
    }, options);

    return fetch(url, options)
        .then((response) => {
            raw = response;
            return response;
        })
        .then(parseStatus)
        .then(parseJSON)
        .then(userFeedback)
        .then((response) => callback(response, raw))
        .catch((error) => {
            if (silentErrors) {
                console.debug('[Request] silent failure', url, error);
                return undefined;
            }

            userFeedbackError(error);

            return undefined;
        });
};

export default request;
