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
            // Go to Step 2
            loadPluginDependencies(slug, function(dependencies) {
                $('.remove-plugin-step-1').addClass('hidden');

                if (dependencies.length > 0) {
                    addDependenciesToList(dependencies);
                    $('.remove-plugin-step-2').removeClass('hidden');
                } else {
                    $('.remove-plugin-done').removeClass('hidden');
                }
            });
        }
    });
});

var loadPluginDependencies = function loadPluginDependencies(plugin, callback) {
    let url = `${config.base_url_relative}/plugins.json/task${config.param_sep}getPluginDependencies/plugin:${plugin}/admin-nonce${config.param_sep}${config.admin_nonce}`;
    request(url, {
        method: 'get',
    }, (response) => {
        callback(response.dependencies);
    });
}

var addDependencyToList = function addDependencyToList(dependency) {
    var container = $('.plugin-dependencies-container');
    container.append(`<li>${dependency} <a href="#" class="button" data-dependency-slug="${dependency}" data-plugin-action="remove-dependency">Remove</a></li>`);
};

var addDependenciesToList = function addDependenciesToList(dependencies) {
    dependencies.forEach(function(dependency) {
        addDependencyToList(dependency);
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

            // add further dependencies i can remove to the bottom of the list
            loadPluginDependencies(slug, function(dependencies) {
                if (dependencies.length > 0) {
                    addDependenciesToList(dependencies);
                }
            });
        }
    });
});
