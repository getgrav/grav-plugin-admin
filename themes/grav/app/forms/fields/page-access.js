import $ from 'jquery';

const body = $('body');

body.on('change', '[data-page_access] input[type="checkbox"]', () => { console.log('checkbox'); });
body.on('change', '[data-page_access] select', (event) => {
    console.log('select');
    const target = $(event.currentTarget);
    const value = target.val();
    const inputs = target.closest('.permissions-item').find('input[name]');

    inputs.each((index, input) => {
        input = $(input);
        const name = input.prop('name');
        console.log(name.match(/(\[[^]]*\])$/));
        console.log(name, name.replace(/(.*)(\[[^\]]*\])/, `$1[${value}]`));
        input.prop('name', name.replace(/(.*)(\[[^\]]*\])/, `$1[${value}]`));
    });

    $('.permissions-item .button.add-item')[!value ? 'addClass' : 'removeClass']('disabled').prop('disabled', !value ? 'disabled' : null);
});

body.on('click', '[data-page_access] .remove-item', (event) => {
    console.log('remove-item');
    const target = $(event.currentTarget);
    const container = target.closest('.permissions-item');
    container.remove();

    const empty = $('.permissions-item').length === 1;

    // show the initial + button
    if (empty) {
        $('.permissions-item.empty-list').removeClass('hidden');
    }
});

body.on('click', '[data-page_access] .add-item', (event) => {
    const target = $(event.currentTarget);
    const item = target.closest('.permissions-item');
    const template = document.querySelector('template#page-access-item');

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
    $('.permissions-item.empty-list').addClass('hidden');

    // disable all + buttons until one is selected
    $('.permissions-item .button.add-item').addClass('disabled').prop('disabled', 'disabled');
});
