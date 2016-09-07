import toastr from './toastr';
import { config } from 'grav-config';
import trim from 'mout/string/trim';

let error = function(response) {
    let error = new Error(response.statusText || response || '');
    error.response = response;

    return error;
};

export function parseStatus(response) {
    return response;

    /* Whoops can handle JSON responses so we don't need this for now.
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            throw error(response);
        }
    */
}

export function parseJSON(response) {
    return response.text().then((text) => {
        var parsed = text;
        try {
            parsed = JSON.parse(text);
        } catch (error) {
            let content = document.createElement('div');
            content.innerHTML = text;

            let error = new Error();
            error.stack = trim(content.innerText);

            throw error;
        }

        return parsed;
    });
}

export function userFeedback(response) {
    let status = response.status || (response.error ? 'error' : '');
    let message = response.message || (response.error ? response.error.message : null);
    let settings = response.toastr || null;
    let backup;

    switch (status) {
        case 'unauthenticated':
            document.location.href = config.base_url_relative;
            throw error('Logged out');
        case 'unauthorized':
            status = 'error';
            message = message || 'Unauthorized.';
            break;
        case 'error':
            status = 'error';
            message = message || 'Unknown error.';
            break;
        case 'success':
            status = 'success';
            message = message || '';
            break;
        default:
            status = 'error';
            message = message || 'Invalid AJAX response.';
            break;
    }

    if (settings) {
        backup = Object.assign({}, toastr.options);
        Object.keys(settings).forEach((key) => { toastr.options[key] = settings[key]; });
    }

    if (message) { toastr[status === 'success' ? 'success' : 'error'](message); }

    if (settings) {
        toastr.options = backup;
    }

    return response;
}

export function userFeedbackError(error) {
    let stack = error.stack ? `<pre><code>${error.stack}</code></pre>` : '';
    toastr.error(`Fetch Failed: <br /> ${error.message} ${stack}`);
    console.error(`${error.message} at ${error.stack}`);
}
