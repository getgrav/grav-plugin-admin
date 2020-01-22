import $ from 'jquery';

const body = $('body');

body.on('change', '[data-acl_picker] select', (event) => {
    const target = $(event.currentTarget);
    const value = target.val();
    const inputs = target.closest('.permissions-item').find('input[name]');
    const wrapper = target.closest('[data-acl_picker_id]');

    inputs.each((index, input) => {
        input = $(input);
        const name = input.prop('name');
        input.prop('name', name.replace(/(.*)(\[[^\]]*\])/, `$1[${value}]`));
    });

    wrapper.find('.permissions-item .button.add-item')[!value ? 'addClass' : 'removeClass']('disabled').prop('disabled', !value ? 'disabled' : null);
});

body.on('click', '[data-acl_picker] .remove-item', (event) => {
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
    const target = $(event.currentTarget);
    const item = target.closest('.permissions-item');
    const wrapper = target.closest('[data-acl_picker_id]');
    const ID = wrapper.data('acl_picker_id');
    const template = document.querySelector(`template[data-id="acl_picker-${ID}"]`);

    const clone = $(template.content.querySelector(':first-child')).clone();
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
