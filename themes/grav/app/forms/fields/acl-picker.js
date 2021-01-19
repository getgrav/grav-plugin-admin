import $ from 'jquery';

const body = $('body');

body.on('change', '[data-acl_picker] select', (event) => {
    const target = $(event.currentTarget);
    const value = target.val();
    const item = target.closest('.permissions-item');
    const inputs = item.find('input[type="checkbox"], input[type="radio"]');
    const hidden = item.find('input[type="hidden"][name]');
    const wrapper = target.closest('[data-acl_picker_id]');
    const type = item.data('fieldType');

    if (type === 'access') {
        inputs.each((index, input) => {
            input = $(input);
            const name = input.prop('name');
            input.prop('name', name.replace(/(.*)(\[[^\]]*\])/, `$1[${value}]`));
        });
    } else if (type === 'permissions') {
        const crudpContainer = item.find('[data-field-name]');
        inputs.each((index, input) => {
            input = $(input);
            const rand = Math.round(Math.random() * 500);
            const name = crudpContainer.data('fieldName');
            const id = input.prop('id').split('_').slice(0, -1).join('_') + `_${value}+${rand}`;
            // const key = input.data('crudpKey');
            hidden.prop('name', name.replace(/(.*)(\[[^\]]*\])/, `$1[${value}]`));
            input.prop('id', id);
            input.next('label').prop('for', id);
        });
    }

    wrapper.find('.permissions-item .button.add-item')[!value ? 'addClass' : 'removeClass']('disabled').prop('disabled', !value ? 'disabled' : null);
});

body.on('input', 'input[data-crudp-key]', (event) => {
    const target = $(event.currentTarget);
    const container = target.closest('.crudp-container');
    const hidden = container.find('input[type="hidden"][name]');
    const key = target.data('crudpKey');
    const json = JSON.parse(hidden.val() || '{}');
    json[key] = target.val();
    hidden.val(JSON.stringify(json));
});

body.on('click', '[data-acl_picker] .remove-item', (event) => {
    event.preventDefault();
    const target = $(event.currentTarget);
    const container = target.closest('.permissions-item');
    const wrapper = target.closest('[data-acl_picker_id]');
    container.remove();

    const empty = wrapper.find('.permissions-item').length === 1;

    // show the initial + button
    if (empty) {
        wrapper.find('.permissions-item.empty-list').removeClass('hidden');
    }
});

body.on('click', '[data-acl_picker] .add-item', (event) => {
    event.preventDefault();
    const target = $(event.currentTarget);
    const item = target.closest('.permissions-item');
    const wrapper = target.closest('[data-acl_picker_id]');
    const ID = wrapper.data('acl_picker_id');
    const template = document.querySelector(`template[data-id="acl_picker-${ID}"]`);

    const clone = $(template.content.firstElementChild).clone();
    clone.insertAfter(item);

    // randomize ids
    clone.find('.switch-toggle input[type="radio"]').each((index, input) => {
        input = $(input);
        const id = input.prop('id');
        const label = input.next('label');
        const rand = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toLowerCase();

        input.prop('id', `${id}${rand}`);
        label.prop('for', `${id}${rand}`);
    });

    // hide the initial + button
    wrapper.find('.permissions-item.empty-list').addClass('hidden');

    // disable all + buttons until one is selected
    wrapper.find('.permissions-item .button.add-item').addClass('disabled').prop('disabled', 'disabled');
});
