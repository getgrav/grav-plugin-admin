import $ from 'jquery';
import { setParam } from 'mout/queryString';

const prepareQuery = (key, value) => {
    return setParam(global.location.href, key, value);
};

$(document).on('change', '.logs-content .block-select select[name]', (event) => {
    const target = $(event.currentTarget);
    const name = target.attr('name');
    const value = target.val();

    global.location.href = prepareQuery(name, value);
});
