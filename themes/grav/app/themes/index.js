import $ from 'jquery';
import packages from '../utils/packages';

// Themes Switcher Warning
$(document).on('mousedown', '[data-remodal-target="theme-switch-warn"]', (event) => {
    let name = $(event.target).closest('[data-gpm-theme]').find('.gpm-name a:first').text();
    let remodal = $('.remodal.theme-switcher');

    remodal.find('strong').text(name);
    remodal.find('.button.continue').attr('href', $(event.target).attr('href'));
});

// Removing theme
$(document).on('click', '[data-plugin-action="remove-theme"]', (event) => {
    let slug = $(event.target).data('theme-slug');

    event.preventDefault();
    event.stopPropagation();

    packages.removeTheme(slug);
});

$(document).on('click', '[data-package-action="remove-dependency-theme"]', (event) => {
    let slug = $(event.target).data('dependency-slug');
    let button = $(event.target);

    event.preventDefault();
    event.stopPropagation();

    packages.removeDependency('theme', slug, button);
});
