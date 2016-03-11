import $ from 'jquery';
import Cookies from 'cookies-js';

let Data = JSON.parse(Cookies.get('grav-tabs-state') || '{}');

$('body').on('touchstart click', '[name^="tab-"]', (event) => {
    event && event.stopPropagation();
    let target = $(event.currentTarget);

    Data[target.attr('name')] = target.val();
    Cookies.set('grav-tabs-state', JSON.stringify(Data), { expires: Infinity });
});
