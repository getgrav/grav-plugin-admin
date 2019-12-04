import $ from 'jquery';

$(document).on('click', '[data-page-move] button[name="task"][value="save"]', (event) => {
    /* let route = $('form#blueprints:first select[name="data[route]"]');
    let moveTo = $('[data-page-move] select').val();

    if (route.length && route.val() !== moveTo) {
        let selectize = route.data('selectize');
        route.val(moveTo);

        if (selectize) selectize.setValue(moveTo);
    }*/

    const modal = $(event.currentTarget).closest('[data-remodal-id]');
    const parents = modal.data('parents') || {};
    const finder = parents.finder;

    if (!parents || !finder) { return true; }

    const field = parents.field;
    const parentLabel = parents.parentLabel;
    const parentName = parents.parentName;
    const selection = finder.findLastActive().item[0];
    const value = selection._item[finder.config.valueKey];
    const name = selection._item[finder.config.labelKey];

    field.val(value);
    parentLabel.text(value);
    parentName.text(name);
    finder.config.defaultPath = value;

    $('<div />').css({
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 15000
    }).appendTo($('body'));
});

/*
$(document).on('click', '[data-remodal-id="parents"] [data-parents-select]', (event) => {
    const modal = $(event.currentTarget).closest('[data-remodal-id]');
    const parents = modal.data('parents');
    const finder = parents.finder;
    const field = parents.field;
    const parentLabel = parents.parentLabel;
    const parentName = parents.parentName;
    const selection = finder.findLastActive().item[0];
    const value = selection._item[finder.config.valueKey];
    const name = selection._item[finder.config.labelKey];

    field.val(value);
    parentLabel.text(value);
    parentName.text(name);
    finder.config.defaultPath = value;

    const remodal = $.remodal.lookup[$(`[data-remodal-id="${modal.data('remodalId')}"]`).data('remodal')];
    remodal.close();
});
*/
