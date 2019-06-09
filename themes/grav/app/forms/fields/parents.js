import $ from 'jquery';
import Finder from '../../utils/finderjs';
import { config as gravConfig } from 'grav-config';

let XHRUUID = 0;
export const Instances = {};

export class Parents {
    constructor(container, field, data) {
        this.container = $(container);
        this.fieldName = field.attr('name');
        this.field = $(`[name="${this.fieldName}"]`);
        this.data = data;
        this.parentLabel = $(`[data-parents-field-label="${this.fieldName}"]`);
        this.parentName = $(`[data-parents-field-name="${this.fieldName}"]`);

        const dataLoad = this.dataLoad;

        this.finder = new Finder(
            this.container,
            (parent, callback) => {
                return dataLoad.call(this, parent, callback);
            },
            {
                labelKey: 'name',
                defaultPath: this.field.val(),
                createItemContent: function(item) {
                    return Parents.createItemContent(this.config, item);
                }
            }
        );

        /*
        this.finder.$emitter.on('leaf-selected', (item) => {
            console.log('selected', item);
            this.finder.emit('create-column', () => this.createSimpleColumn(item));
        });

        this.finder.$emitter.on('item-selected', (selected) => {
            console.log('selected', selected);
            // for future use only - create column-card creation for file with details like in macOS finder
            // this.finder.$emitter('create-column', () => this.createSimpleColumn(selected));
        }); */

        this.finder.$emitter.on('column-created', () => {
            this.container[0].scrollLeft = this.container[0].scrollWidth - this.container[0].clientWidth;
        });
    }

    static createItemContent(config, item) {
        const frag = document.createDocumentFragment();

        const label = $(`<span title="${item[config.labelKey]}" />`);
        const iconPrepend = $('<i />');
        const iconAppend = $('<i />');
        const prependClasses = ['fa'];
        const appendClasses = ['fa'];

        // prepend icon
        if (item.children || item.type === 'dir') {
            prependClasses.push('fa-folder');
        } else if (item.type === 'root') {
            prependClasses.push('fa-sitemap');
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
                route: b64_encode_unicode(parent.value),
                field: this.field.data('fieldName')
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

$(document).on('click', '[data-parents]', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const target = $(event.currentTarget);
    let field = target.closest('.parents-wrapper').find('input[name]');
    let fieldName = field.attr('name');

    if (!field.length) {
        fieldName = target.data('parents');
        field = $(`[name="${target.data('parents')}"]`).first();
    }

    const modal = $(`[data-remodal-id="${target.data('remodalTarget') || 'parents'}"]`);
    const loader = modal.find('.grav-loading');
    const content = modal.find('.parents-content');

    loader.css('display', 'block');
    content.html('');
    $.ajax({
        url: `${gravConfig.base_url_relative}/ajax.json/task${gravConfig.param_sep}getFolderListing`,
        method: 'post',
        data: {
            route: b64_encode_unicode(field.val()),
            field: field.data('fieldName'),
            initial: true
        },
        success(response) {
            loader.css('display', 'none');

            if (response.status === 'error') {
                content.html(response.message);
                return true;
            }

            if (!Instances[`${fieldName}-${modal.data('remodalId')}`]) {
                Instances[`${fieldName}-${modal.data('remodalId')}`] = new Parents(content, field, response.data);
            } else {
                Instances[`${fieldName}-${modal.data('remodalId')}`].finder.reload(response.data);
            }

            modal.data('parents', Instances[`${fieldName}-${modal.data('remodalId')}`]);

        }
    });
});

// apply finder selection to field
$(document).on('click', '[data-remodal-id].parents-container [data-parents-select]', (event) => {
    const modal = $(event.currentTarget).closest('[data-remodal-id]');
    const parents = modal.data('parents');
    const finder = parents.finder;
    const field = parents.field;
    const parentLabel = parents.parentLabel;
    const parentName = parents.parentName;
    const selection = finder.findLastActive().item[0];
    const value = selection._item[finder.config.valueKey];
    const name = selection._item[finder.config.labelKey];

    field.val(value);
    parentLabel.text(value);
    parentName.text(name);
    finder.config.defaultPath = value;

    const remodal = $.remodal.lookup[$(`[data-remodal-id="${modal.data('remodalId')}"]`).data('remodal')];
    remodal.close();
});
