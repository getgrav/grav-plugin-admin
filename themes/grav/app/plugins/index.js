import $ from 'jquery';
import packages from '../utils/packages';
import camelCase from 'mout/string/camelCase';

// Plugins sliders details
$('.gpm-name, .gpm-actions').on('click', function(e) {
    let element = $(this);
    let target = $(e.target);
    let tag = target.prop('tagName').toLowerCase();

    if (tag === 'a' || element.parent('a').length || target.parent('a').length) { return true; }

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
$(document).on('click', '[data-plugin-action="remove-package"]', (event) => {
    packages.handleRemovingPackage('plugin', event);
});

$(document).on('click', '[data-plugin-action="remove-dependency-package"]', (event) => {
    packages.handleRemovingDependency('plugin', event);
});

// Trigger the add new plugin / update plugin modal
$(document).on('click', '[data-plugin-action="start-package-installation"]', (event) => {
    packages.handleGettingPackageDependencies('plugin', event, 'install');
});

// Trigger the update all plugins modal
$(document).on('click', '[data-plugin-action="start-packages-update"]', (event) => {
    packages.handleGettingPackageDependencies('plugin', event);
});

// Install a plugin dependencies and the plugin
$(document).on('click', '[data-plugin-action="install-dependencies-and-package"]', (event) => {
    packages.handleInstallingDependenciesAndPackage('plugin', event);
});

// Install a plugin
$(document).on('click', '[data-plugin-action="install-package"]', (event) => {
    packages.handleInstallingPackage('plugin', event);
});

// Sort plugins
$(document).on('change', '.sort-actions select', (event) => {
    let direction = $('.sort-actions .sort-icon .fa').hasClass('fa-sort-amount-desc') ? 'desc' : 'asc';
    let sorting = $(event.currentTarget).val();

    packages.Sort[camelCase(`by-${sorting}`)](direction);
});

// Sort plugins
$(document).on('click', '.sort-icon', (event) => {
    let icon = $(event.currentTarget).find('.fa');
    let current = icon.hasClass('fa-sort-amount-asc') ? 'asc' : 'desc';
    let opposite = current === 'asc' ? 'desc' : 'asc';

    icon.removeClass(`fa-sort-amount-${current}`).addClass(`fa-sort-amount-${opposite}`);
    $('.sort-actions select').trigger('change');
});
