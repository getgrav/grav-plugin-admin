/* eslint-disable */
import $ from 'jquery';

let TRIGGER = null;

$(document).on('click', '[data-remodal-changelog]', (event) => {
    TRIGGER = event.currentTarget;
});

$(document).on('opened', '[data-remodal-id="changelog"]', () => {
    const instance = $.remodal.lookup[$('[data-remodal-id=changelog]').data('remodal')];
    if (!TRIGGER) { return true; }

    const url = $(TRIGGER).data('remodalChangelog');

    $.ajax({url: url}).done(function(data) {
        instance.$modal.html(data);
    });
});
