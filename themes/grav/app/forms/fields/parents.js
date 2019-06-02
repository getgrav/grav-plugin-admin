import $ from 'jquery';
import Finder from 'finderjs';
import { config } from 'grav-config';

let XHRUUID = 0;

export class Parents {
    constructor(container, data) {
        this.container = $(container);
        this.data = data;
        this.finder = Finder(
            this.container[0],
            (parent, config, callback) => this.dataLoad(parent, config, callback),
            {
                labelKey: 'filename',
                createItemContent: (config, item) => Parents.createItemContent(config, item)
            }
        );

        /* this.finder.on('leaf-selected', (item) => {
            this.finder.emit('create-column', () => this.createSimpleColumn(item));
        });
        */

        this.finder.on('column-created', () => {
            this.container[0].scrollLeft = this.container[0].scrollWidth - this.container[0].clientWidth;
        });
    }

    static createItemContent(config, item) {
        const data = item.children || config.data;
        const frag = document.createDocumentFragment();

        const label = $('<span />');
        const iconPrepend = $('<i />');
        const iconAppend = $('<i />');
        const prependClasses = ['fa'];
        const appendClasses = ['fa'];

        // prepend icon
        if (data || item.type === 'dir') {
            prependClasses.push('fa-folder');
        } else if (item.type === 'file') {
            prependClasses.push('fa-file-o');
        }

        iconPrepend.addClass(prependClasses.join(' '));

        // text label
        label.text(item[config.labelKey]).prepend(iconPrepend);
        label.appendTo(frag);

        // append icon
        if (data || item.type === 'dir') {
            appendClasses.push('fa-caret-right');
        }

        iconAppend.addClass(appendClasses.join(' '));
        iconAppend.appendTo(frag);

        return frag;
    }

    createSimpleColumn(item) {}

    createLoadingColumn() {
        return $(`
            <div class="fjs-col leaf-col" style="overflow: hidden;">
                <div class="leaf-row">
                    <div class="grav-loading"><div class="grav-loader">Loading...</div></div>
                </div>
            </div>
        `);
    }

    createErrorColumn(error) {
        return $(`
            <div class="fjs-col leaf-col" style="overflow: hidden;">
                <div class="leaf-row error">
                    <i class="fa fa-fw fa-warning"></i>
                    <span>${error}</span>
                </div>
            </div>
        `);
    }

    dataLoad(parent, config, callback) {
        console.log(parent, config, callback);

        if (!parent) {
            return callback(this.data);
        }

        const UUID = ++XHRUUID;
        this.startLoader(config);

        $.ajax({
            url: `${config.base_url_relative}/ajax.json/task:getFolderListing`,
            method: 'post',
            data: {
                route: btoa(parent.basename)
            },
            success: (response) => {
                response = JSON.parse(response);
                this.stopLoader();

                if (response.status === 'error') {
                    config.emitter.emit('create-column', this.createErrorColumn(response.message)[0]);
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

    startLoader(config) {
        this.loadingIndicator = this.createLoadingColumn();
        config.emitter.emit('create-column', this.loadingIndicator[0]);

        return this.loadingIndicator;
    }

    stopLoader() {
        return this.loadingIndicator && this.loadingIndicator.remove();
    }
}

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
        url: `${config.base_url_relative}/ajax.json/task:getFolderListing`,
        method: 'post',
        data: {
            route: btoa(field.val()),
            initial: true
        },
        success(response) {
            loader.css('display', 'none');

            if (response.status === 'error') {
                content.html(response.message);
                return true;
            }

            target.data('parents-field', new Parents(content, response.data));
        }
    });
});
