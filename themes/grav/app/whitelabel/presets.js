import $ from 'jquery';
import Forms from '../forms';

let body = $('body');
let fields = [];
const FormState = Forms.FormState.Instance;
const setField = (field, value) => {
    let name = field.prop('name');
    let tag = field.prop('tagName').toLowerCase();
    let type = field.prop('type');

    fields.push(name);
    switch (tag) {
        case 'select':
            field.val(value);
            field.data('selectize').setValue(value);
            field.trigger('change');
            break;
        case 'input':
            if (type === 'radio') {
                let strValue = value ? '1' : '0';
                field.filter((index, radio) => $(radio).val() === strValue).prop('checked', true);

                break;
            }

            if (type === 'checkbox') {
                field.prop('checked', value);
                break;
            }
            field.val(value);
            field.trigger('keyup');
    }
};

body.on('click', '[data-preset-values]', (event) => {
    let target = $(event.currentTarget);
    let data = target.data('preset-values');

    Object.keys(data).forEach((section) => {
        if (typeof data[section] === 'string') {
            return;
        }

        Object.keys(data[section]).forEach((key) => {
            let field = $(`[name="data[whitelabel][color_scheme][${section}][${key}]"], [name="data[${section}][${key}]"]`);
            let value = data[section][key];
            setField(field, value);
        });
    });
});

body.on('click', '[data-reset-scss]', (event) => {
    event && event.preventDefault();
    let element = $(event.currentTarget);
    let links = $('link[id^=admin-pro-preview-]');

    element.remove();
    links.remove();

    fields.forEach((field) => {
        let value = FormState.loadState.get(field);
        setField($(`[name="${field}"]`), value);
    });
    fields = [];
});

// Horizontal Scroll Functionality
$.fn.hscrollarrows = function() {
    return this.each(function() {

        let navNext = $('<a class="nav-next hide"></a>');
        let navPrev = $('<a class="nav-prev hide"></a>');
        let scrollTime = null;
        let resizeTime = null;
        let scrolling = false;

        let elm_w = 0;
        let elem_data_w = 0;
        let max_scroll = 0;
        let inc_scroll = 0;

        let calcData = function() {
            elm_w = elem.width();
            elem_data_w = elem_data.get(0).scrollWidth;
            max_scroll = elem_data_w - elm_w;
            inc_scroll = elm_w * 0.3; // 20%
        };

        let revalidate = function() {
            calcData();
            stateNavs();
        };

        let run = function() {
            calcData();
            setupNavs();
        };

        let setupNavs = function() {

            elem.parent().prepend(navNext);
            elem.parent().prepend(navPrev);
            navNext.on('click', next);
            navPrev.on('click', prev);
            stateNavs();

            $(elem).scroll(function() {
                if (!scrolling) {
                    clearTimeout(scrollTime);
                    scrollTime = setTimeout(function() {
                        stateNavs();
                    }, 250);
                }
            });

            $(window).resize(function() {
                clearTimeout(resizeTime);
                resizeTime = setTimeout(function() {
                    revalidate();
                }, 250);
            });
        };

        let stateNavs = function() {
            let current_scroll = elem.scrollLeft();
            if (current_scroll < max_scroll) {
                navNext.removeClass('hide');
            } else {
                navNext.addClass('hide');
            }
            if (current_scroll > 0) {
                navPrev.removeClass('hide');
            } else {
                navPrev.addClass('hide');
            }
            scrolling = false;
        };

        let next = function() {
            let current_scroll = elem.scrollLeft();
            if (current_scroll < max_scroll) {
                scrolling = true;
                elem.stop().animate({
                    scrollLeft: (current_scroll + inc_scroll)
                }, stateNavs);
            }
        };

        let prev = function() {
            let current_scroll = elem.scrollLeft();
            if (current_scroll > 0) {
                scrolling = true;
                elem.stop().animate({
                    scrollLeft: (current_scroll - inc_scroll)
                }, stateNavs);
            }
        };

        let elem = $(this);
        let elem_data = $(':first-child', elem);
        run();

    });
};

$(document).ready(() => {
    $('.jquery-horizontal-scroll').hscrollarrows();
});
