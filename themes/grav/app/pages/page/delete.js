import $ from 'jquery';

$(document).on('click', '[data-remodal-target="delete"]', function() {
    let confirm = $('[data-remodal-id="delete"] [data-delete-action]');
    let link = $(this).data('delete-url');

    confirm.data('delete-action', link);
});

$(document).on('click', '[data-delete-action]', function() {
    let remodal = $.remodal.lookup[$('[data-remodal-id="delete"]').data('remodal')];

    global.location.href = $(this).data('delete-action');
    remodal.close();
});
