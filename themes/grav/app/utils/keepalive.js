import { config } from 'grav-config';
import { userFeedbackError } from './response';

const MAX_SAFE_DELAY = 2147483647;

class KeepAlive {
    constructor() {
        this.active = false;
    }

    start() {
        let timeout = config.admin_timeout / 1.5 * 1000;
        this.timer = setInterval(() => this.fetch(), Math.min(timeout, MAX_SAFE_DELAY));
        this.active = true;
    }

    stop() {
        clearInterval(this.timer);
        this.active = false;
    }

    fetch() {
        let data = new FormData();
        data.append('admin-nonce', config.admin_nonce);

        fetch(`${config.base_url_relative}/task${config.param_sep}keepAlive`, {
            credentials: 'same-origin',
            method: 'post',
            body: data
        }).catch(userFeedbackError);
    }
}

export default new KeepAlive();
