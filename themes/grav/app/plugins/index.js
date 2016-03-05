/* eslint-disable */
import $ from 'jquery';
import { config } from 'grav-config';
import request from '../utils/request';

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

// Removing plugin flow

// Step 1: remove the actual plugin that I want to remove
$(document).on('click', '[data-plugin-action="remove-plugin"]', (event) => {
    let slug = $(event.target).data('plugin-slug');
    let url = `${config.base_url_relative}/plugins.json/task${config.param_sep}removePlugin/admin-nonce${config.param_sep}${config.admin_nonce}`;

    event.preventDefault();
    event.stopPropagation();

    request(url, {
        method: 'post',
        body: {
            plugin: slug
        }
    }, (response) => {
        if (response.status == 'success') {
            $('.remove-plugin-confirm').addClass('hidden');

            if (response.dependencies.length > 0) {
                addDependenciesToList(response.dependencies);
                $('.remove-plugin-dependencies').removeClass('hidden');
            } else {
                $('.remove-plugin-done').removeClass('hidden');
                getBackToPluginsList();
            }

            //The plugin was removed. When the modal closes, move to the plugins list
            $(document).on('closing', '[data-remodal-id="delete-plugin"]', function (e) {
                getBackToPluginsList();
            });
        }
    });
});

var getBackToPluginsList = function getBackToPluginsList() {
    window.location.href = `${config.base_url_relative}/plugins`;
};

var addDependencyToList = function addDependencyToList(dependency, slug = '') {
    var container = $('.plugin-dependencies-container');
    var text = `${dependency} <a href="#" class="button" data-dependency-slug="${dependency}" data-plugin-action="remove-dependency">Remove</a>`;
    if (slug) {
        text += ` (was needed by ${slug})`;
    }

    container.append(`<li>${text}</li>`);
};

var addDependenciesToList = function addDependenciesToList(dependencies, slug = '') {
    dependencies.forEach(function(dependency) {
        addDependencyToList(dependency, slug);
    });
};

$(document).on('click', '[data-plugin-action="remove-dependency"]', (event) => {
    let slug = $(event.target).data('dependency-slug');
    let url = `${config.base_url_relative}/plugins.json/task${config.param_sep}removePlugin/admin-nonce${config.param_sep}${config.admin_nonce}`;

    event.preventDefault();
    event.stopPropagation();

    request(url, {
        method: 'post',
        body: {
            plugin: slug
        }
    }, (response) => {
        if (response.status == 'success') {
            $(event.target).removeClass('button');
            $(event.target).replaceWith($('<span>Removed successfully</span>'));

            if (response.dependencies.length > 0) {
                addDependenciesToList(response.dependencies, slug);
            }
        }
    });
});
