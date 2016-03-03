import $ from 'jquery';

// Themes Switcher Warning
$(document).on('mousedown', '[data-remodal-target="theme-switch-warn"]', (event) => {
    let name = $(event.target).closest('[data-gpm-theme]').find('.gpm-name a:first').text();
    let remodal = $('.remodal.theme-switcher');

    remodal.find('strong').text(name);
    remodal.find('.button.continue').attr('href', $(event.target).attr('href'));
});
