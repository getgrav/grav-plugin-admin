/* eslint-disable */
import { config } from 'grav-config';
import request from '../utils/request';

class Packages {

    getBackToPluginsList() {
        window.location.href = `${config.base_url_relative}/plugins`;
    }

    addDependencyToList(dependency, slug = '') {
        let container = $('.plugin-dependencies-container');
        let text = `${dependency} <a href="#" class="button" data-dependency-slug="${dependency}" data-plugin-action="remove-dependency">Remove</a>`;

        if (slug) {
            text += ` (was needed by ${slug})`;
        }

        container.append(`<li>${text}</li>`);
    }

    addDependenciesToList(dependencies, slug = '') {
        dependencies.forEach((dependency) => {
            this.addDependencyToList(dependency, slug);
        });
    }

    removePackage(slug) {
        let url = `${config.base_url_relative}/plugins.json/task${config.param_sep}removePlugin/admin-nonce${config.param_sep}${config.admin_nonce}`;

        request(url, {
            method: 'post',
            body: {
                plugin: slug
            }
        }, (response) => {
            if (response.status == 'success') {
                $('.remove-plugin-confirm').addClass('hidden');

                if (response.dependencies.length > 0) {
                    this.addDependenciesToList(response.dependencies);
                    $('.remove-plugin-dependencies').removeClass('hidden');
                } else {
                    $('.remove-plugin-done').removeClass('hidden');
                    this.getBackToPluginsList();
                }

                //The plugin was removed. When the modal closes, move to the plugins list
                $(document).on('closing', '[data-remodal-id="delete-plugin"]', (e) => {
                    this.getBackToPluginsList();
                });
            }
        });
    }

    removeDependency(slug, button) {
        let url = `${config.base_url_relative}/plugins.json/task${config.param_sep}removePlugin/admin-nonce${config.param_sep}${config.admin_nonce}`;

        request(url, {
            method: 'post',
            body: {
                plugin: slug
            }
        }, (response) => {
            if (response.status == 'success') {
                button.removeClass('button');
                button.replaceWith($('<span>Removed successfully</span>'));

                if (response.dependencies.length > 0) {
                    this.addDependenciesToList(response.dependencies, slug);
                }
            }
        });
    }
}

export default new Packages();
