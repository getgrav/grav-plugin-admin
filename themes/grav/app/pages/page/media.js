import $ from 'jquery';
import Dropzone from 'dropzone';
import request from '../../utils/request';
import { config, translations } from 'grav-config';

Dropzone.autoDiscover = false;
Dropzone.options.gravPageDropzone = {};
Dropzone.confirm = (question, accepted, rejected) => {
    let doc = $(document);
    let modalSelector = '[data-remodal-id="delete-media"]';

    let removeEvents = () => {
        doc.off('confirmation', modalSelector, accept);
        doc.off('cancellation', modalSelector, reject);
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
          <a class="dz-remove" href="javascript:undefined;" data-dz-remove>Delete</a>
          <a class="dz-insert" href="javascript:undefined;" data-dz-insert>Insert</a>
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
        }, options);

        this.dropzone = new Dropzone(container, this.options);
        this.dropzone.on('complete', this.onDropzoneComplete.bind(this));
        this.dropzone.on('success', this.onDropzoneSuccess.bind(this));
        this.dropzone.on('removedfile', this.onDropzoneRemovedFile.bind(this));
        this.dropzone.on('sending', this.onDropzoneSending.bind(this));
        this.dropzone.on('error', this.onDropzoneError.bind(this));

        this.fetchMedia();
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
    }

    onDropzoneRemovedFile(file, ...extra) {
        console.log(file.name, 'acc', file.accepted, 'rej', file.rejected);
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
}

export let Instance = new PageMedia();

// let container = $('[data-media-url]');

// if (container.length) {
/*    let URI = container.data('media-url');
    let dropzone = new Dropzone('#grav-dropzone', {
        url: `${URI}/task${config.param_sep}addmedia`,
        createImageThumbnails: { thumbnailWidth: 150 },
        addRemoveLinks: false,
        dictRemoveFileConfirmation: '[placeholder]',
        acceptedFiles: container.data('media-types'),
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
          <a class="dz-remove" href="javascript:undefined;" data-dz-remove>Delete</a>
          <a class="dz-insert" href="javascript:undefined;" data-dz-insert>Insert</a>
        </div>`
    });*/

    /* $.get(URI + '/task{{ config.system.param_sep }}listmedia/admin-nonce{{ config.system.param_sep }}' +  GravAdmin.config.admin_nonce, function(data) {

        $.proxy(modalError, this, {
            data: data,
            msg: '<p>An error occurred while trying to list files</p><pre>'+data.message+'</pre>'
        })();

        if (data.results) {
            $.each(data.results, function(filename, data){
                var mockFile = { name: filename, size: data.size, accepted: true, extras: data };
                thisDropzone.files.push(mockFile);
                thisDropzone.options.addedfile.call(thisDropzone, mockFile);

                if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                    thisDropzone.options.thumbnail.call(thisDropzone, mockFile, data.url);
                }
            });
        }

        $('.dz-preview').prop('draggable', 'true');
    });*/

    // console.log(dropzone);
// }

/*
<script>
$(function(){
    var URI = $('[data-media-url]').data('media-url'), thisDropzone,
        modalError = function(args){
            if (args.data.status == 'error' || args.data.status == 'unauthorized'){

                if (args.mode == 'addBack'){
                    // let's add back the file
                    if (args.file instanceof File) this.addFile(args.file);
                    else {
                        this.files.push(args.file);
                        this.options.addedfile.call(this, args.file);
                        this.options.thumbnail.call(this, args.file, args.file.extras.url);
                    }
                } else if (args.mode == 'removeFile') {
                    args.file.rejected = true;
                    this.removeFile(args.file);
                }

                // fire up the modal
                var modalContainer = $('[data-remodal-id=generic]');
                modalContainer.find('.error-content').html(args.msg);
                $.remodal.lookup[modalContainer.data('remodal')].open();
            }
        };
    Dropzone.autoDiscover = false;
    Dropzone.confirm = function(question, accepted, rejected) {
        var modalContainer = $('[data-remodal-id=delete-media]'),
            acceptHandler = function () {
                if (accepted) {
                    accepted();
                }
                $(document).off('confirm', '[data-remodal-id=delete-media]', acceptHandler);
                $(document).off('cancel', '[data-remodal-id=delete-media]', rejectHandler);
            },
            rejectHandler = function () {
                if (rejected) {
                    rejected();
                }
                $(document).off('confirm', '[data-remodal-id=delete-media]', acceptHandler);
                $(document).off('cancel', '[data-remodal-id=delete-media]', rejectHandler);
            };

        $.remodal.lookup[modalContainer.data('remodal')].open();
        $(document).on('confirm', '[data-remodal-id=delete-media]', acceptHandler);
        $(document).on('cancel', '[data-remodal-id=delete-media]', rejectHandler);
    };
    Dropzone.options.gravDropzone = {
        addRemoveLinks: false,
        dictRemoveFileConfirmation: '[placeholder]',
        acceptedFiles: $('[data-media-types]').data('media-types'),
        previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    " +
        "<div class=\"dz-filename\"><span data-dz-name></span></div>\n    " +
        "<div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail />\n  </div>\n  " +
        "<div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  "+
        "<div class=\"dz-success-mark\"><span>✔</span></div>\n  <div class=\"dz-error-mark\"><span>✘</span></div>\n  " +
        "<div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n" +
        "<a class=\"dz-remove\" href=\"javascript:undefined;\" data-dz-remove>Delete</a>\n" +
        "<a class=\"dz-insert\" href=\"javascript:undefined;\" data-dz-insert>Insert</a>\n</div>",
        init: function() {
            thisDropzone = this;
            $.get(URI + '/task{{ config.system.param_sep }}listmedia/admin-nonce{{ config.system.param_sep }}' +  GravAdmin.config.admin_nonce, function(data) {

                $.proxy(modalError, this, {
                    data: data,
                    msg: '<p>An error occurred while trying to list files</p><pre>'+data.message+'</pre>'
                })();

                if (data.results) {
                    $.each(data.results, function(filename, data){
                        var mockFile = { name: filename, size: data.size, accepted: true, extras: data };
                        thisDropzone.files.push(mockFile);
                        thisDropzone.options.addedfile.call(thisDropzone, mockFile);

                        if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                            thisDropzone.options.thumbnail.call(thisDropzone, mockFile, data.url);
                        }
                    });
                }

                $('.dz-preview').prop('draggable', 'true');
            });

            this.on("complete", function(file) {
                if (file.accepted) {
                    $('.dz-preview').prop('draggable', 'true');
                    return;
                }
                var data = {status: 'error', message: 'Unsupported file type: ' + file.name.match(/\..+/).join('')};
                $.proxy(modalError, this, {
                    file: file,
                    data: data,
                    mode: 'removeFile',
                    msg: '<p>An error occurred while trying to add the file <strong>'+file.name+'</strong></p><pre>'+data.message+'</pre>'
                })();
            });

            this.on('success', function(file, response){
                thisDropzone = this;
                $.proxy(modalError, this, {
                    file: file,
                    data: response,
                    mode: 'removeFile',
                    msg: '<p>An error occurred while trying to upload the file <strong>'+file.name+'</strong></p><pre>'+response.message+'</pre>'
                })();
            });

            this.on('removedfile', function(file) {
                if (!file.accepted || file.rejected) return;
                thisDropzone = this;
                $.post(URI + '/task{{ config.system.param_sep }}delmedia', {filename: file.name, 'admin-nonce': GravAdmin.config.admin_nonce}, function(data){
                    $.proxy(modalError, thisDropzone, {
                        file: file,
                        data: data,
                        mode: 'addBack',
                        msg: '<p>An error occurred while trying to remove the file <strong>'+file.name+'</strong></p><pre>'+data.message+'</pre>'
                    })();
                });
            });

            this.on('sending', function(file, xhr, formData){
                formData.append('admin-nonce', GravAdmin.config.admin_nonce);
            });
        }
    };

    var dropzone = new Dropzone("#gravDropzone", { url: URI + '/task{{ config.system.param_sep }}addmedia', createImageThumbnails: { thumbnailWidth: 150} });

    $("#gravDropzone").delegate('.dz-preview', 'dragstart', function(e){
        var uri = encodeURI($(this).find('.dz-filename').text());
        uri = uri.replace(/\(/g, '%28');
        uri = uri.replace(/\)/g, '%29');

        var shortcode = '![](' + uri + ')';
        if (!uri.match(/\.(jpg|jpeg|png|gif)$/)) {
            shortcode = '[' + decodeURI(uri) + '](' + uri + ')';
        }

        dropzone.disable();
        $(this).addClass('hide-backface');
        e.originalEvent.dataTransfer.effectAllowed = 'copy';
        e.originalEvent.dataTransfer.setData('text', shortcode);
    });

    $("#gravDropzone").delegate('.dz-preview', 'dragend', function(e){
        dropzone.enable();
        $(this).removeClass('hide-backface');
    });
});
</script>*/
