/* eslint-disable */
import { config } from 'grav-config';
import request from '../utils/request';

class Packages {

    getBackToList(type) {
        window.location.href = `${config.base_url_relative}/${type}s`;
    }

    addDependencyToList(type, dependency, slug = '') {
        let container = $('.package-dependencies-container');
        let text = `${dependency} <a href="#" class="button" data-dependency-slug="${dependency}" data-package-action="remove-dependency-${type}">Remove</a>`;

        if (slug) {
            text += ` (was needed by ${slug})`;
        }

        container.append(`<li>${text}</li>`);
    }

    addDependenciesToList(dependencies, slug = '') {
        dependencies.forEach((dependency) => {
            this.addDependencyToList('plugin', dependency, slug);
        });
    }

    removePlugin(slug) {
        this.removePackage('plugin', slug);
    }

    removeTheme(slug) {
        this.removePackage('theme', slug);
    }

    getRemoveUrl(type) {
        var url = `${config.base_url_relative}`;

        if (type === 'plugin') {
            url += `/plugins.json`;
        } else if (type === 'theme') {
            url += `/themes.json`;
        }

        url += `/task${config.param_sep}removePackage`;

        return url;
    }

    removePackage(type, slug) {
        let url = this.getRemoveUrl(type);

        request(url, {
            method: 'post',
            body: {
                plugin: slug
            }
        }, (response) => {
            if (response.status == 'success') {
                $('.remove-package-confirm').addClass('hidden');

                if (response.dependencies.length > 0) {
                    this.addDependenciesToList(response.dependencies);
                    $('.remove-package-dependencies').removeClass('hidden');
                } else {
                    $('.remove-package-done').removeClass('hidden');
                }

                //The package was removed. When the modal closes, move to the packages list
                $(document).on('closing', '[data-remodal-id="delete-package"]', (e) => {
                    this.getBackToList(type);
                });
            }
        });
    }

    removeDependency(type, slug, button) {
        let url = this.getRemoveUrl(type);

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
