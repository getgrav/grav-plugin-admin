import $ from 'jquery';
import Cookies from '../../utils/cookies.js';
import request from '../../utils/request';
import FilesField, { UriToMarkdown } from '../../forms/fields/files';
import { config, translations } from 'grav-config';
import { Instance as Editor } from '../../forms/fields/editor';
import Sortable from 'sortablejs';

const previewTemplate = `
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
      <a class="dz-remove" title="${translations.PLUGIN_ADMIN.DELETE}" href="javascript:undefined;" data-dz-remove>${translations.PLUGIN_ADMIN.DELETE}</a>
      <a class="dz-metadata" title="${translations.PLUGIN_ADMIN.METADATA}" href="#" target="_blank" data-dz-metadata>${translations.PLUGIN_ADMIN.METADATA}</a>
      <a class="dz-view" title="${translations.PLUGIN_ADMIN.VIEW}" href="#" target="_blank" data-dz-view>${translations.PLUGIN_ADMIN.VIEW}</a>
      <a class="dz-insert" title="${translations.PLUGIN_ADMIN.INSERT}" href="javascript:undefined;" data-dz-insert>${translations.PLUGIN_ADMIN.INSERT}</a>
    </div>`.trim();

export default class PageMedia extends FilesField {
    constructor({ container = '#grav-dropzone', options = {} } = {}) {
        options = Object.assign(options, { previewTemplate });
        super({ container, options });
        if (!this.container.length) { return; }

        this.urls = {
            fetch: `${this.container.data('media-url')}/task${config.param_sep}listmedia`,
            add: `${this.container.data('media-url')}/task${config.param_sep}addmedia`,
            delete: `${this.container.data('media-url')}/task${config.param_sep}delmedia`
        };

        this.dropzone.options.url = this.urls.add;

        if (typeof this.options.fetchMedia === 'undefined' || this.options.fetchMedia) {
            this.fetchMedia();
        }

        if (typeof this.options.attachDragDrop === 'undefined' || this.options.attachDragDrop) {
            this.attachDragDrop();
        }

        const field = $(`[name="${this.container.data('dropzone-field')}"]`);

        if (field.length) {
            this.sortable = new Sortable(this.container.get(0), {
                animation: 150,
                // forceFallback: true,
                setData: (dataTransfer, target) => {
                    target = $(target);
                    let uri = encodeURI(target.find('.dz-filename').text());
                    let shortcode = UriToMarkdown(uri);
                    this.dropzone.disable();
                    target.addClass('hide-backface');
                    dataTransfer.effectAllowed = 'copy';
                    dataTransfer.setData('text', shortcode);
                },
                onSort: () => {
                    let names = [];
                    this.container.find('[data-dz-name]').each((index, file) => {
                        file = $(file);
                        const name = file.text().trim();
                        names.push(name);
                    });

                    field.val(names.join(','));
                }
            });
        }
    }

    fetchMedia() {
        const order = this.container.closest('.form-field').find('[name="data[header][media_order]"]').val();
        const body = { uri: this.getURI(), order };
        let url = this.urls.fetch;

        request(url, { method: 'post', body }, (response) => {
            let results = response.results;

            Object.keys(results).forEach((name) => {
                let data = results[name];
                let mock = { name, size: data.size, accepted: true, extras: data };

                this.dropzone.files.push(mock);
                this.dropzone.options.addedfile.call(this.dropzone, mock);
                this.dropzone.options.thumbnail.call(this.dropzone, mock, data.url);
            });

            this.updateThumbsSize();
            this.container.find('.dz-preview').prop('draggable', 'true');
        });
    }

    onDropzoneSending(file, xhr, formData) {
        /*
        // Cannot call super because Safari and IE API don't implement `delete`
        super.onDropzoneSending(file, xhr, formData);
        formData.delete('task');
        */

        formData.append('name', this.options.dotNotation || file.name);
        formData.append('admin-nonce', config.admin_nonce);
        formData.append('uri', this.getURI());
    }

    onDropzoneComplete(file) {
        super.onDropzoneComplete(file);
        if (this.sortable) {
            this.sortable.options.onSort();
        }

        // accepted
        this.updateThumbsSize();
        this.updateMediaCount();
        $('.dz-preview').prop('draggable', 'true');
    }

    onDropzoneAddedFile(file, ...extra) {
      super.onDropzoneAddedFile(file, extra);

      this.updateThumbsSize();
    }

    onDropzoneRemovedFile(file, ...extra) {
        super.onDropzoneRemovedFile(file, ...extra);

        this.updateMediaCount();
        if (this.sortable) {
            this.sortable.options.onSort();
        }
    }

    updateThumbsSize() {
      const status = JSON.parse(Cookies.get('grav-admin-pagemedia') || '{}');

      if (status.width) {
        const input = this.container.closest('.pagemedia-field').find('.media-resizer');
        updateMediaSizes(input, status.width, false);
      }
    }

    updateMediaCount() {
      const element = this.container.closest('.pagemedia-field').find('[data-pagemedia-count]');
      element.text(`(${this.dropzone.files.length})`);
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

        this.container.delegate('[data-dz-view]', 'mouseenter', (e) => {
            let target = $(e.currentTarget);
            let file = target.parent('.dz-preview').find('.dz-filename');
            let filename = encodeURI(file.text());
            let URL = target.closest('[data-media-path]').data('media-path');
            let original = this.dropzone.files.filter((file) => encodeURI(file.name) === filename).shift();

            original = original && ((original.extras && original.extras.original) || encodeURI(original.name));

            target.attr('href', `${URL}/${original}`);
        });

        this.container.delegate('[data-dz-metadata]', 'click', (e) => {
            e.preventDefault();
            const target = $(e.currentTarget);
            const file = target.parent('.dz-preview').find('.dz-filename');
            const filename = encodeURI(file.text());
            const cleanName = file.text().replace('<', '&lt;').replace('>', '&gt;');

            let fileObj = this.dropzone.files.filter((file) => file.name === global.decodeURI(filename)).shift() || {};

            if (!fileObj.extras) {
                fileObj.extras = { metadata: [] };
            }

            if (Array.isArray(fileObj.extras.metadata) && !fileObj.extras.metadata.length) {
                fileObj.extras.metadata = { '': `${cleanName}.meta.yaml doesn't exist` };
            }

            fileObj = fileObj.extras;

            const modal_element = $('body').find('[data-remodal-id="metadata"]');
            const modal = $.remodal.lookup[modal_element.data('remodal')];

            modal_element.find('h1 strong').html(cleanName);
            if (fileObj.url) {
                modal_element.find('.meta-preview').html(`<img src="${fileObj.url}" />`);
            }

            const container = modal_element.find('.meta-content').html('<ul />').find('ul');
            Object.keys(fileObj.metadata).forEach((meta) => {
                const cleanMeta = fileObj.metadata[meta].replace('<', '&lt;').replace('>', '&gt;');
                container.append(`<li><strong>${meta ? meta + ':' : ''}</strong> ${cleanMeta}</li>`);
            });

            modal.open();
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

export const updateMediaSizes = (input, width, store = true) => {
  const status = JSON.parse(Cookies.get('grav-admin-pagemedia') || '{}');

  const height = 150 * width / 200;
  const media = input.closest('.pagemedia-field').find('.dz-details, [data-dz-thumbnail]');

  media.css({ width, height });

  if (store) {
    const data = Object.assign({}, status, { width });
    Cookies.set('grav-admin-pagemedia', JSON.stringify(data), { expires: Infinity });
  }
};

export const updateMediaCollapseStatus = (element, store = true) => {
  const status = JSON.parse(Cookies.get('grav-admin-pagemedia') || '{}');

  element = $(element);
  const icon = element.find('i.fa');
  const container = element.closest('.pagemedia-field');
  const panel = container.find('.form-data');
  const slider = container.find('.media-resizer').parent();

  const isCollapsed = !icon.hasClass('fa-chevron-down');
  const collapsed = !isCollapsed;

  icon.removeClass('fa-chevron-down fa-chevron-right').addClass(isCollapsed ? 'fa-chevron-down' : 'fa-chevron-right');
  slider[isCollapsed ? 'removeClass' : 'addClass']('hidden');
  panel[isCollapsed ? 'slideDown' : 'slideUp']();

  if (store) {
    const data = Object.assign({}, status, { collapsed });
    Cookies.set('grav-admin-pagemedia', JSON.stringify(data), { expires: Infinity });
  }
};

$(document).on('input', '.media-resizer', (event) => {
  const target = $(event.currentTarget);
  const width = target.val();

  updateMediaSizes(target, width);
});

$(document).on('click', '.media-collapser', (event) => {
  updateMediaCollapseStatus(event.currentTarget);
});

$(document).ready(() => {
  const status = JSON.parse(Cookies.get('grav-admin-pagemedia') || '{}');
  if (status.width) {
    $('.media-resizer').each((index, input) => {
      input = $(input);
      updateMediaSizes(input, status.width, false);
    });
  }
});

export let Instance = new PageMedia();
