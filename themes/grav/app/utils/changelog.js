/* eslint-disable */
import $ from 'jquery';

let TRIGGER = null;

$(document).on('click', '[data-remodal-changelog]', (event) => {
    TRIGGER = event.currentTarget;
});

$(document).on('opened', '[data-remodal-id="changelog"]', () => {
    const instance = $.remodal.lookup[$('[data-remodal-id=changelog]').data('remodal')];
    instance.$modal.html('<div class="changelog-overflow center" style="padding:5rem 0;text-align:center;"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i></div>');
    if (!TRIGGER) { return true; }

    const url = $(TRIGGER).data('remodalChangelog');

    $.ajax({url: url}).done(function(data) {
        instance.$modal.html(data);
    });
});

$(document).on('closed', '[data-remodal-id="changelog"]', () => {
    const instance = $.remodal.lookup[$('[data-remodal-id=changelog]').data('remodal')];
    instance.$modal.html('');
});
