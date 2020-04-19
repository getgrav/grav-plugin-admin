import { config } from 'grav-config';
import request from '../utils/request';

export default ({ preview = false, color_scheme = {}, fonts = {}, callback = () => {} } = {}) => {
    const URI = `${config.current_url}.json/task:compileScss`;
    request(URI, {
        method: 'post',
        body: Object.assign({}, preview ? { preview } : null, color_scheme, fonts)
    }, callback);
};

export const prepareElement = (element) => {
    element.data('busy_right_now', true);
    if (!element.data('current_icon')) {
        element.data('current_icon', element.find('.fa').attr('class'));
    }
    element.find('.fa').attr('class', 'fa fa-fw fa-spin fa-spinner');
};

export const resetElement = (element) => {
    element.data('busy_right_now', false);
    element.find('.fa').attr('class', element.data('current_icon'));
};
