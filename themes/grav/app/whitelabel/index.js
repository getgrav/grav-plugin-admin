import $ from 'jquery';
import Compile, { prepareElement, resetElement } from './compile';
import Forms from '../forms';
import { hex2rgb } from '../utils/colors';
import './presets';

const body = $('body');
const FormState = Forms.FormState.Instance;
const compiler = (element, preview = false, exportScss = false, callback = () => {}) => {
    prepareElement(element);

    let fields = FormState.collect();
    Compile({
        preview,
        exportScss,
        color_scheme: !fields ? [] : fields.filter((value, key) => key.match(/^data\[whitelabel]\[color_scheme]/)).toJS(),
        callback: (response) => {
            callback.call(callback, response);
            resetElement(element);
        }
    });
};

body.on('click', '[data-preview-scss]', (event) => {
    event && event.preventDefault();
    let element = $(event.currentTarget);
    if (element.data('busy_right_now')) { return false; }

    compiler(element, true, false, (response) => {
        if (response.files) {
            Object.keys(response.files).forEach((key) => {
                let file = $(`#admin-pro-preview-${key}`);
                let timestamp = Date.now();
                if (!file.length) {
                    file = $(`<link id="admin-pro-preview-${key}" type="text/css" rel="stylesheet" />`);
                    $('head').append(file);

                    if (!$('[data-reset-scss]').length) {
                        let reset = $('<button class="button" data-reset-scss style="margin-left: 5px;"><i class="fa fa-fw fa-history"></i> Reset</button>');
                        reset.insertAfter(element);
                    }
                }

                file.attr('href', `${response.files[key]}?${timestamp}`);
            });
        }
    });
});

body.on('click', '[data-recompile-scss]', (event) => {
    event && event.preventDefault();
    let element = $(event.currentTarget);
    if (element.data('busy_right_now')) { return false; }

    compiler(element, true, false);
});

body.on('click', '[data-export-scss]', (event) => {
    event && event.preventDefault();
    let element = $(event.currentTarget);
    if (element.data('busy_right_now')) { return false; }

    compiler(element, true, true, (response) => {
        if (response.files) {
            Object.keys(response.files).forEach((key) => {
                if (key === 'download') {
                    let element = document.createElement('a');
                    element.setAttribute('href', response.files[key]);
                    element.setAttribute('download', '');

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                }
            });
        }
    });
});

body.on('change._grav_colorpicker', '[data-grav-colorpicker]', (event, input, hex, opacity) => {
    let RGB = hex2rgb(hex);
    let YIQ = ((RGB.r * 299) + (RGB.g * 587) + (RGB.b * 114)) / 1000;
    let contrast = YIQ >= 128 || opacity <= 0.50 ? 'dark' : 'light';

    input.parent().removeClass('dark-text light-text').addClass(`${contrast}-text`);
});

body.ready(() => {
    $('[data-grav-colorpicker]').trigger('keyup');
});
