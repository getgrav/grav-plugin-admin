/* eslint-disable */
import $ from 'jquery';
import packages from '../utils/packages';

// Plugins sliders details
$('.gpm-name, .gpm-actions').on('click', function(e) {
    let element = $(this);
    let target = $(e.target);
    let tag = target.prop('tagName').toLowerCase();

    if (tag === 'a' || element.parent('a').length) { return true; }

    let wrapper = element.siblings('.gpm-details').find('.table-wrapper');

    wrapper.slideToggle({
        duration: 350,
        complete: () => {
            let visible = wrapper.is(':visible');
            wrapper
                .closest('tr')
                .find('.gpm-details-expand i')
                .removeClass('fa-chevron-' + (visible ? 'down' : 'up'))
                .addClass('fa-chevron-' + (visible ? 'up' : 'down'));
        }
    });
});

// Removing plugin
$(document).on('click', '[data-plugin-action="remove-plugin"]', (event) => {
    let slug = $(event.target).data('plugin-slug');

    event.preventDefault();
    event.stopPropagation();

    packages.removePlugin(slug);
});

$(document).on('click', '[data-package-action="remove-dependency-plugin"]', (event) => {
    let slug = $(event.target).data('dependency-slug');
    let button = $(event.target);

    event.preventDefault();
    event.stopPropagation();

    packages.removeDependency('plugin', slug, button);
});
