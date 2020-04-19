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
        if (typeof data[section] === 'string') { return; }

        Object.keys(data[section]).forEach((key) => {
            let field = $(`[name="data[color_scheme][${section}][${key}]"], [name="data[${section}][${key}]"]`);
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
