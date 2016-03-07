/* eslint-disable */
import { config } from 'grav-config';
import request from '../utils/request';

class Packages {

    static getBackToList(type) {
        window.location.href = `${config.base_url_relative}/${type}s`;
    }

    static addDependencyToList(type, dependency, slug = '') {
        let container = $('.package-dependencies-container');
        let text = `${dependency} <a href="#" class="button" data-dependency-slug="${dependency}" data-package-action="remove-dependency-${type}">Remove</a>`;

        if (slug) {
            text += ` (was needed by ${slug})`;
        }

        container.append(`<li>${text}</li>`);
    }

    addDependenciesToList(dependencies, slug = '') {
        dependencies.forEach((dependency) => {
            Packages.addDependencyToList('plugin', dependency, slug);
        });
    }

    removePlugin(slug) {
        this.removePackage('plugin', slug);
    }

    removeTheme(slug) {
        this.removePackage('theme', slug);
    }

    static getTaskUrl(type, task) {
        var url = `${config.base_url_relative}`;

        if (type === 'plugin') {
            url += `/plugins.json`;
        } else if (type === 'theme') {
            url += `/themes.json`;
        }

        url += `/task${config.param_sep}${task}`;

        return url;
    }

    static getRemovePackageUrl(type) {
        return `${Packages.getTaskUrl(type, 'removePackage')}`;
    }

    static getAddPackageUrl(type) {
        return `${Packages.getTaskUrl(type, 'addPackage')}`;
    }

    static getPackageDependenciesUrl(type) {
        return `${Packages.getTaskUrl(type, 'packageDependencies')}`;
    }

    static getInstallDependenciesOfPackageUrl(type) {
        return `${Packages.getTaskUrl(type, 'installDependenciesOfPackage')}`;
    }

    static getInstallPackageUrl(type) {
        return `${Packages.getTaskUrl(type, 'installPackage')}`;
    }

    removePackage(type, slug) {
        let url = Packages.getRemovePackageUrl(type);

        request(url, {
            method: 'post',
            body: {
                package: slug
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
                $(document).on('closing', '[data-remodal-id="delete-package"]', () => {
                    Packages.getBackToList(type);
                });
            }
        });
    }

    removeDependency(type, slug, button) {
        let url = Packages.getRemovePackageUrl(type);

        request(url, {
            method: 'post',
            body: {
                package: slug
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

    addNeededDependencyToList(type, dependency) {
        $('.install-dependencies-package-container .type-' + type).removeClass('hidden');
        let list = $('.install-dependencies-package-container .type-' + type + ' ul');
        let text = `${dependency}`;// <a href="#" class="button" data-dependency-slug="${dependency}" data-package-action="remove-dependency-${type}">Remove</a>`;
        list.append(`<li>${text}</li>`);
    }

    getPackageDependencies(type, slug, finishedLoadingCallback) {
        let url = Packages.getPackageDependenciesUrl(type);

        //check dependencies
        request(url, {
            method: 'post',
            body: {
                package: slug
            }
        }, (response) => {

            finishedLoadingCallback();

            if (response.status == 'success') {
                if (response.dependencies) {
                    var hasDependencies = false;
                    for (var dependency in response.dependencies) {
                        if (response.dependencies.hasOwnProperty(dependency)) {
                            hasDependencies = true;
                            let dependencyName = dependency;
                            let dependencyType = response.dependencies[dependency];

                            this.addNeededDependencyToList(dependencyType, dependencyName);
                        }
                    }

                    if (hasDependencies) {
                        $('.install-dependencies-package-container').removeClass('hidden');
                    } else {
                        //can install right away
                        alert('has NO dep');
                    }
                }
            }
        });
    }

    installDependenciesOfPackage(type, slug, callbackSuccess, callbackError) {
        let url = Packages.getInstallDependenciesOfPackageUrl(type);

        //check dependencies
        request(url, {
            method: 'post',
            body: {
                package: slug
            }
        }, (response) => {

            if (response.status == 'success') {
                callbackSuccess();
            } else {
                callbackError();
            }
        });
    }

    installPackage(type, slug, callbackSuccess, callbackError) {
        let url = Packages.getInstallPackageUrl(type);

        //check dependencies
        request(url, {
            method: 'post',
            body: {
                package: slug,
                type: type
            }
        }, (response) => {

            if (response.status == 'success') {
                callbackSuccess();
            } else {
                callbackError();
            }
        });
    }
}

export default new Packages();
