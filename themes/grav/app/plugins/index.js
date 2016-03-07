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

var getSlugFromEvent = (event) => {
    var slug = '';
    if ($(event.target).is('[data-plugin-slug]')) {
        slug = $(event.target).data('plugin-slug');
    } else {
        slug = $(event.target).parent('[data-plugin-slug]').data('plugin-slug');
    }

    return slug;
};

// Opened the add new plugin modal
$(document).on('click', '[data-plugin-action="get-plugin-dependencies"]', (event) => {
    var slug = getSlugFromEvent(event);
    event.preventDefault();
    event.stopPropagation();

    $('[data-remodal-id="add-package"] .loading').removeClass('hidden');
    $('[data-remodal-id="add-package"] .install-dependencies-package-container').addClass('hidden');
    $('[data-remodal-id="add-package"] .install-package-container').addClass('hidden');
    $('[data-remodal-id="add-package"] .installing-dependencies').addClass('hidden');
    $('[data-remodal-id="add-package"] .installing-package').addClass('hidden');
    $('[data-remodal-id="add-package"] .installation-complete').addClass('hidden');
    $('[data-remodal-id="add-package"] .install-dependencies-package-container .button-bar').removeClass('hidden');
    $('[data-remodal-id="add-package"] .install-package-container .button-bar').removeClass('hidden');

    packages.getPackageDependencies('plugin', slug, () => {
        $('[data-remodal-id="add-package"] [data-plugin-action="install-dependencies-and-package"]').attr('data-plugin-slug', slug);
        $('[data-remodal-id="add-package"] [data-plugin-action="install-package"]').attr('data-plugin-slug', slug);
        $('[data-remodal-id="add-package"] .loading').addClass('hidden');
    });
});

// Install a plugin dependencies and the plugin
$(document).on('click', '[data-plugin-action="install-dependencies-and-package"]', (event) => {
    var slug = getSlugFromEvent(event);
    var type = 'plugin';
    event.preventDefault();
    event.stopPropagation();

    $('.install-dependencies-package-container .button-bar').addClass('hidden');
    $('.installing-dependencies').removeClass('hidden');

    packages.installDependenciesOfPackage('plugin', slug, () => {
        $('.installing-dependencies').addClass('hidden');
        $('.installing-package').removeClass('hidden');
        packages.installPackage('plugin', slug, () => {
            $('.installing-package').addClass('hidden');
            $('.installation-complete').removeClass('hidden');
            window.location.href = `${config.base_url_relative}/${type}s/${slug}`;
        }, () => {
            console.log('ERROR');
        });
    }, () => {
        console.log('ERROR');
    });
});

// Install a plugin
$(document).on('click', '[data-plugin-action="install-package"]', (event) => {
    var slug = getSlugFromEvent(event);
    var type = 'plugin';
    event.preventDefault();
    event.stopPropagation();

    $('.install-package-container .button-bar').addClass('hidden');
    $('.installing-package').removeClass('hidden');

    packages.installPackage('plugin', slug, () => {
        $('.installing-package').addClass('hidden');
        $('.installation-complete').removeClass('hidden');
        window.location.href = `${config.base_url_relative}/${type}s/${slug}`;
    }, () => {
        console.log('ERROR');
    })
});