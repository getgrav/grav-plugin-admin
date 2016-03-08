/* eslint-disable */
import { config } from 'grav-config';
import request from '../utils/request';

class Packages {

    static getBackToList(type) {
        window.location.href = `${config.base_url_relative}/${type}s`;
    }

    static addDependencyToList(type, dependency, slug = '') {
        let container = $('.package-dependencies-container');
        let text = `${dependency} <a href="#" class="button" data-dependency-slug="${dependency}" data-${type}-action="remove-dependency-package">Remove</a>`;

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

    static getTaskUrl(type, task) {
        var url = `${config.base_url_relative}`;
        url += `/${type}s.json`;
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
                $(document).on('closing', '[data-remodal-id="remove-package"]', () => {
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

    static addNeededDependencyToList(type, dependency) {
        $('.install-dependencies-package-container .type-' + type).removeClass('hidden');
        let list = $('.install-dependencies-package-container .type-' + type + ' ul');
        let text = `${dependency}`;
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

                            Packages.addNeededDependencyToList(dependencyType, dependencyName);
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

    static getSlugFromEvent(event) {
        var slug = '';
        if ($(event.target).is('[data-package-slug]')) {
            slug = $(event.target).data('package-slug');
        } else {
            slug = $(event.target).parent('[data-package-slug]').data('package-slug');
        }

        return slug;
    }

    handleGettingPackageDependencies(type, event) {
        var slug = Packages.getSlugFromEvent(event);
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

        this.getPackageDependencies(type, slug, () => {
            $(`[data-remodal-id="add-package"] [data-${type}-action="install-dependencies-and-package"]`).attr('data-package-slug', slug);
            $(`[data-remodal-id="add-package"] [data-${type}-action="install-package"]`).attr('data-package-slug', slug);
            $('[data-remodal-id="add-package"] .loading').addClass('hidden');
        });
    }

    handleInstallingDependenciesAndPackage(type, event) {
        var slug = Packages.getSlugFromEvent(event);
        event.preventDefault();
        event.stopPropagation();

        $('.install-dependencies-package-container .button-bar').addClass('hidden');
        $('.installing-dependencies').removeClass('hidden');

        this.installDependenciesOfPackage(type, slug, () => {
            $('.installing-dependencies').addClass('hidden');
            $('.installing-package').removeClass('hidden');
            this.installPackage(type, slug, () => {
                $('.installing-package').addClass('hidden');
                $('.installation-complete').removeClass('hidden');
                window.location.href = `${config.base_url_relative}/${type}s/${slug}`;
            }, () => {
                console.log('ERROR');
            });
        }, () => {
            console.log('ERROR');
        });
    }

    handleInstallingPackage(type, event) {
        var slug = Packages.getSlugFromEvent(event);
        event.preventDefault();
        event.stopPropagation();

        $('.install-package-container .button-bar').addClass('hidden');
        $('.installing-package').removeClass('hidden');

        this.installPackage(type, slug, () => {
            $('.installing-package').addClass('hidden');
            $('.installation-complete').removeClass('hidden');
            window.location.href = `${config.base_url_relative}/${type}s/${slug}`;
        }, () => {
            console.log('ERROR');
        })
    }

    handleRemovingPackage(type, event) {
        let slug = $(event.target).data('package-slug');
        event.preventDefault();
        event.stopPropagation();

        this.removePackage(type, slug);
    }

    handleRemovingDependency(type, event) {
        let slug = $(event.target).data('dependency-slug');
        let button = $(event.target);
        event.preventDefault();
        event.stopPropagation();

        this.removeDependency(type, slug, button);
    }

}

export default new Packages();
