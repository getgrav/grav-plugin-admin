import $ from 'jquery';
import Finder from '../../utils/finderjs';
import { config as gravConfig } from 'grav-config';

let XHRUUID = 0;

export class Parents {
    constructor(container, field, data) {
        this.container = $(container);
        this.field = $(field);
        this.data = data;

        const dataLoad = this.dataLoad;
        console.log(finder);

        this.finder = new Finder(
            this.container,
            (parent, callback) => {
                return dataLoad.call(this, parent, callback);
            },
            {
                labelKey: 'name',
                // defaultPath: this.field.val(),
                createItemContent: function(item) {
                    return Parents.createItemContent(this.config, item);
                }
            }
        );

        /*
        this.finder = finder(
            this.container[0],
            function(parent, config, callback) {
                return dataLoad(parent, config, callback);
            },
            {
                labelKey: 'name',
                // defaultPath: this.field.val(),
                createItemContent: (config, item) => Parents.createItemContent(config, item)
            }
        );
        */
        /* this.finder.on('leaf-selected', (item) => {
            this.finder.emit('create-column', () => this.createSimpleColumn(item));
        });
        */

        this.finder.$emitter.on('leaf-selected', (item) => {
            this.finder.emit('create-column', () => this.createSimpleColumn(item));
        });

        this.finder.$emitter.on('column-created', () => {
            this.container[0].scrollLeft = this.container[0].scrollWidth - this.container[0].clientWidth;
        });
    }

    static createItemContent(config, item) {
        const frag = document.createDocumentFragment();

        const label = $('<span />');
        const iconPrepend = $('<i />');
        const iconAppend = $('<i />');
        const prependClasses = ['fa'];
        const appendClasses = ['fa'];

        // prepend icon
        if (item.children || item.type === 'dir') {
            prependClasses.push('fa-folder');
        } else if (item.type === 'file') {
            prependClasses.push('fa-file-o');
        }

        iconPrepend.addClass(prependClasses.join(' '));

        // text label
        label.text(item[config.labelKey]).prepend(iconPrepend);
        label.appendTo(frag);

        // append icon
        if (item.children || item.type === 'dir') {
            appendClasses.push('fa-caret-right');
        }

        iconAppend.addClass(appendClasses.join(' '));
        iconAppend.appendTo(frag);

        return frag;
    }

    static createLoadingColumn() {
        return $(`
            <div class="fjs-col leaf-col" style="overflow: hidden;">
                <div class="leaf-row">
                    <div class="grav-loading"><div class="grav-loader">Loading...</div></div>
                </div>
            </div>
        `);
    }

    static createErrorColumn(error) {
        return $(`
            <div class="fjs-col leaf-col" style="overflow: hidden;">
                <div class="leaf-row error">
                    <i class="fa fa-fw fa-warning"></i>
                    <span>${error}</span>
                </div>
            </div>
        `);
    }

    createSimpleColumn(item) {}

    dataLoad(parent, callback) {
        console.log(this, parent, callback);

        if (!parent) {
            return callback(this.data);
        }

        if (parent.type !== 'dir') {
            return false;
        }

        const UUID = ++XHRUUID;
        this.startLoader();

        $.ajax({
            url: `${gravConfig.base_url_relative}/ajax.json/task${gravConfig.param_sep}getFolderListing`,
            method: 'post',
            data: {
                route: b64_encode_unicode(parent.value)
            },
            success: (response) => {
                this.stopLoader();

                if (response.status === 'error') {
                    this.finder.$emitter.emit('create-column', Parents.createErrorColumn(response.message)[0]);
                    return false;
                }
                // stale request
                if (UUID !== XHRUUID) {
                    return false;
                }

                return callback(response.data);
            }
        });
    }

    startLoader() {
        this.loadingIndicator = Parents.createLoadingColumn();
        this.finder.$emitter.emit('create-column', this.loadingIndicator[0]);

        return this.loadingIndicator;
    }

    stopLoader() {
        return this.loadingIndicator && this.loadingIndicator.remove();
    }
}

export const b64_encode_unicode = (str) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
};

export const b64_decode_unicode = (str) => {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
};

$(window).ready(() => {
    $(document).on('click', '[data-field-parents]', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const target = $(event.currentTarget);
        const field = target.closest('.parents-wrapper').find('input[name]');
        const modal = $('[data-remodal-id="parents"]');
        const loader = modal.find('.grav-loading');
        const content = modal.find('.parents-content');

        loader.css('display', 'block');
        content.html('');
        $.ajax({
            url: `${gravConfig.base_url_relative}/ajax.json/task${gravConfig.param_sep}getFolderListing`,
            method: 'post',
            data: {
                route: b64_encode_unicode(field.val()),
                initial: true
            },
            success(response) {
                loader.css('display', 'none');

                if (response.status === 'error') {
                    content.html(response.message);
                    return true;
                }

                target.data('parents-field', new Parents(content, field, response.data));
            }
        });
    });
});
