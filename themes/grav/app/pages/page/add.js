import $ from 'jquery';
import '../../utils/jquery-utils';
import request from '../../utils/request';
import { config } from 'grav-config';

let custom = false;
let moduleCopyModal = false;

let folder = $('[data-remodal-id="modal"] input[name="data[folder]"], [data-remodal-id="module"] input[name="data[folder]"], [data-remodal-id="modal-page-copy"] input[name="data[folder]"]');
let title = $('[data-remodal-id="modal"] input[name="data[title]"], [data-remodal-id="module"] input[name="data[title]"], [data-remodal-id="modal-page-copy"] input[name="data[title]"]');
let getFields = (type, target) => {
    target = $(target);
    let query = `[data-remodal-id="${target.closest('[data-remodal-id]').data('remodal-id')}"]`;

    return {
        title: type === 'title' ? $(target) : $(`${query} input[name="data[title]"]`),
        folder: type === 'folder' ? $(target) : $(`${query} input[name="data[folder]"]`)
    };
};

let isModuleContext = (target) => {
    const modalId = $(target).closest('[data-remodal-id]').data('remodal-id');
    return modalId === 'module' || (modalId === 'modal-page-copy' && moduleCopyModal);
};

// When copying a page, check if the source is a module (folder starts with _)
$(document).on('opened', '[data-remodal-id="modal-page-copy"]', () => {
    const folderInput = $('[data-remodal-id="modal-page-copy"] input[name="data[folder]"]');
    moduleCopyModal = folderInput.val().startsWith('_');
});

title.on('input focus blur', (event) => {
    if (custom) { return true; }
    let elements = getFields('title', event.currentTarget);

    let slug = $.slugify(elements.title.val(), {custom: { "'": '', '\u2018': '', '\u2019': '' }});
    if (isModuleContext(event.currentTarget) && !slug.startsWith('_')) {
        slug = '_' + slug;
    }
    elements.folder.val(slug);
});

folder.on('input', (event) => {
    let elements = getFields('folder', event.currentTarget);

    let input = elements.folder.get(0);
    let value = elements.folder.val();
    let selection = {
        start: input.selectionStart,
        end: input.selectionEnd
    };

    value = value.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9_\-]/g, '');

    const isModule = isModuleContext(event.currentTarget);
    if (isModule && !value.startsWith('_')) {
        value = '_' + value;
        selection.start += 1;
        selection.end += 1;
    } else if (!isModule && value.startsWith('_')) {
        value = value.substring(1);
        selection.start = Math.max(0, selection.start - 1);
        selection.end = Math.max(0, selection.end - 1);
    }

    elements.folder.val(value);
    custom = !!value;

    // restore cursor position
    input.setSelectionRange(selection.start, selection.end);
});

folder.on('focus blur', (event) => {
  getFields('title').title.trigger('input');
});

$(document).on('change', '[name="data[route]"]', (event) => {
    const rawroute = $(event.currentTarget).val();
    const pageTemplate = $('[name="data[name]"]');
    const URI = `${config.base_url_relative}/ajax.json/task${config.param_sep}getChildTypes`;

    if (pageTemplate.length === 0) {
        return;
    }

    request(URI, {
        method: 'post',
        body: { rawroute }
    }, (response) => {
        const type = response.child_type;
        if (type !== '' && type !== 'default') {
            pageTemplate.val(type);
            pageTemplate.data('selectize').setValue(type);
        }
    });
});
