import $ from 'jquery';

const body = $('body');
const radioSelector = '.permission-container.parent-section input[type="radio"]';

const handleParent = (event) => {
    const target = $(event.currentTarget);
    const value = target.val();
    const container = target.closest('.parent-section');
    const fieldset = container.next('fieldset');
    const radios = fieldset.find(`input[type="radio"][value="${value}"]`);

    if (container.data('isLocked') !== false) {
        container.data('isUpdating', true);
        radios.each((index, radio) => {
            const ID = radio.id;
            $(radio).siblings(`[for="${ID}"]`).trigger('click');
        });
        container.data('isUpdating', false);
    }
};

const boundHandleParent = handleParent.bind(handleParent);

body.on('click', '.permission-container.parent-section label', (event) => {
    const target = $(event.currentTarget);
    const container = target.closest('.parent-section');
    container.data('isLocked', true);
});

body.on('input', radioSelector, boundHandleParent);

body.on('input', '.permissions-container input[type="radio"][data-parent-id]', (event) => {
    const target = $(event.currentTarget);
    const parent = $(`[for="${target.data('parentId')}"]`);
    const container = target.closest('fieldset').prev('.permission-container.parent-section');

    if (container.data('isUpdating') === true) {
        return true;
    }

    body.off('input', radioSelector, boundHandleParent);
    container.data('isLocked', false);
    parent.trigger('click');
    body.on('input', radioSelector, boundHandleParent);
});
