/* eslint-disable */
import $ from 'jquery';
import { config } from 'grav-config';
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
$(document).on('click', '[data-plugin-action="remove-package"]', (event) => {
    packages.handleRemovingPackage('plugin', event);
});

$(document).on('click', '[data-plugin-action="remove-dependency-package"]', (event) => {
    packages.handleRemovingDependency('plugin', event);
});

// Opened the add new plugin modal
$(document).on('click', '[data-plugin-action="get-package-dependencies"]', (event) => {
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