import $ from 'jquery';
import Dropzone from 'dropzone';
import request from '../../utils/request';
import { config, translations } from 'grav-config';
import { Instance as Editor } from '../../forms/fields/editor';

Dropzone.autoDiscover = false;
Dropzone.options.gravPageDropzone = {};
Dropzone.confirm = (question, accepted, rejected) => {
    let doc = $(document);
    let modalSelector = '[data-remodal-id="delete-media"]';

    let removeEvents = () => {
        doc.off('confirmation', modalSelector, accept);
        doc.off('cancellation', modalSelector, reject);

        $(modalSelector).find('.remodal-confirm').removeClass('pointer-events-disabled');
    };

    let accept = () => {
        accepted && accepted();
        removeEvents();
    };

    let reject = () => {
        rejected && rejected();
        removeEvents();
    };

    $.remodal.lookup[$(modalSelector).data('remodal')].open();
    doc.on('confirmation', modalSelector, accept);
    doc.on('cancellation', modalSelector, reject);
};

const DropzoneMediaConfig = {
    createImageThumbnails: { thumbnailWidth: 150 },
    addRemoveLinks: false,
    dictDefaultMessage: translations.PLUGIN_ADMIN.DROP_FILES_HERE_TO_UPLOAD,
    dictRemoveFileConfirmation: '[placeholder]',
    previewTemplate: `
        <div class="dz-preview dz-file-preview">
          <div class="dz-details">
            <div class="dz-filename"><span data-dz-name></span></div>
            <div class="dz-size" data-dz-size></div>
            <img data-dz-thumbnail />
          </div>
          <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
          <div class="dz-success-mark"><span>✔</span></div>
          <div class="dz-error-mark"><span>✘</span></div>
          <div class="dz-error-message"><span data-dz-errormessage></span></div>
          <a class="dz-remove" href="javascript:undefined;" data-dz-remove>${translations.PLUGIN_ADMIN.DELETE}</a>
          <a class="dz-insert" href="javascript:undefined;" data-dz-insert>${translations.PLUGIN_ADMIN.INSERT}</a>
        </div>`.trim()
};

export default class PageMedia {
    constructor({form = '[data-media-url]', container = '#grav-dropzone', options = {}} = {}) {
        this.form = $(form);
        this.container = $(container);
        if (!this.form.length || !this.container.length) { return; }

        this.options = Object.assign({}, DropzoneMediaConfig, {
            url: `${this.form.data('media-url')}/task${config.param_sep}addmedia`,
            acceptedFiles: this.form.data('media-types')
        }, this.form.data('dropzone-options'), options);

        this.dropzone = new Dropzone(container, this.options);
        this.dropzone.on('complete', this.onDropzoneComplete.bind(this));
        this.dropzone.on('success', this.onDropzoneSuccess.bind(this));
        this.dropzone.on('removedfile', this.onDropzoneRemovedFile.bind(this));
        this.dropzone.on('sending', this.onDropzoneSending.bind(this));
        this.dropzone.on('error', this.onDropzoneError.bind(this));

        if (typeof this.options.fetchMedia === 'undefined' || this.options.fetchMedia) {
            this.fetchMedia();
        }

        if (typeof this.options.attachDragDrop === 'undefined' || this.options.attachDragDrop) {
            this.attachDragDrop();
        }
    }

    fetchMedia() {
        let url = `${this.form.data('media-url')}/task${config.param_sep}listmedia/admin-nonce${config.param_sep}${config.admin_nonce}`;

        request(url, (response) => {
            let results = response.results;

            Object.keys(results).forEach((name) => {
                let data = results[name];
                let mock = { name, size: data.size, accepted: true, extras: data };

                this.dropzone.files.push(mock);
                this.dropzone.options.addedfile.call(this.dropzone, mock);

                if (name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    this.dropzone.options.thumbnail.call(this.dropzone, mock, data.url);
                }
            });

            this.container.find('.dz-preview').prop('draggable', 'true');
        });
    }

    onDropzoneSending(file, xhr, formData) {
        formData.append('admin-nonce', config.admin_nonce);
    }

    onDropzoneSuccess(file, response, xhr) {
        if (this.options.reloadPage) {
            global.location.reload();
        }

        return this.handleError({
            file,
            data: response,
            mode: 'removeFile',
            msg: `<p>${translations.PLUGIN_ADMIN.FILE_ERROR_UPLOAD} <strong>${file.name}</strong></p>
            <pre>${response.message}</pre>`
        });
    }

    onDropzoneComplete(file) {
        if (!file.accepted) {
            let data = {
                status: 'error',
                message: `${translations.PLUGIN_ADMIN.FILE_UNSUPPORTED}: ${file.name.match(/\..+/).join('')}`
            };

            return this.handleError({
                file,
                data,
                mode: 'removeFile',
                msg: `<p>${translations.PLUGIN_ADMIN.FILE_ERROR_ADD} <strong>${file.name}</strong></p>
                <pre>${data.message}</pre>`
            });
        }

        // accepted
        $('.dz-preview').prop('draggable', 'true');

        if (this.options.reloadPage) {
            global.location.reload();
        }
    }

    onDropzoneRemovedFile(file, ...extra) {
        if (!file.accepted || file.rejected) { return; }
        let url = `${this.form.data('media-url')}/task${config.param_sep}delmedia`;

        request(url, {
            method: 'post',
            body: {
                filename: file.name
            }
        });
    }

    onDropzoneError(file, response, xhr) {
        let message = xhr ? response.error.message : response;
        $(file.previewElement).find('[data-dz-errormessage]').html(message);

        return this.handleError({
            file,
            data: { status: 'error' },
            msg: `<pre>${message}</pre>`
        });
    }

    handleError(options) {
        let { file, data, mode, msg } = options;
        if (data.status !== 'error' && data.status !== 'unauthorized') { return ; }

        switch (mode) {
            case 'addBack':
                if (file instanceof File) {
                    this.dropzone.addFile.call(this.dropzone, file);
                } else {
                    this.dropzone.files.push(file);
                    this.dropzone.options.addedfile.call(this.dropzone, file);
                    this.dropzone.options.thumbnail.call(this.dropzone, file, file.extras.url);
                }

                break;
            case 'removeFile':
                file.rejected = true;
                this.dropzone.removeFile.call(this.dropzone, file);

                break;
            default:
        }

        let modal = $('[data-remodal-id="generic"]');
        modal.find('.error-content').html(msg);
        $.remodal.lookup[modal.data('remodal')].open();
    }

    attachDragDrop() {
        this.container.delegate('[data-dz-insert]', 'click', (e) => {
            let target = $(e.currentTarget).parent('.dz-preview').find('.dz-filename');
            let editor = Editor.editors.filter((index, editor) => $(editor).attr('name') === 'data[content]');

            if (editor.length) {
                editor = editor.data('codemirror');
                editor.focus();

                let filename = encodeURI(target.text());
                let shortcode = UriToMarkdown(filename);
                editor.doc.replaceSelection(shortcode);
            }
        });

        this.container.delegate('.dz-preview', 'dragstart', (e) => {
            let target = $(e.currentTarget);
            let uri = encodeURI(target.find('.dz-filename').text());
            let shortcode = UriToMarkdown(uri);
            this.dropzone.disable();
            target.addClass('hide-backface');
            e.originalEvent.dataTransfer.effectAllowed = 'copy';
            e.originalEvent.dataTransfer.setData('text', shortcode);
        });

        this.container.delegate('.dz-preview', 'dragend', (e) => {
            let target = $(e.currentTarget);
            this.dropzone.enable();
            target.removeClass('hide-backface');
        });
    }
}

export function UriToMarkdown(uri) {
    uri = uri.replace(/@3x|@2x|@1x/, '');
    uri = uri.replace(/\(/g, '%28');
    uri = uri.replace(/\)/g, '%29');

    return uri.match(/\.(jpe?g|png|gif|svg)$/i) ? `![](${uri})` : `[${decodeURI(uri)}](${uri})`;
}

export let Instance = new PageMedia();

