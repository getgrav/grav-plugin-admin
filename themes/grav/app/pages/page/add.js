import $ from 'jquery';
import '../../utils/jquery-utils';

let custom = false;
let folder = $('[data-remodal-id="modal"] input[name="data[folder]"], [data-remodal-id="modular"] input[name="data[folder]"]');
let title = $('[data-remodal-id="modal"] input[name="data[title]"], [data-remodal-id="modular"] input[name="data[title]"]');
let getFields = (type, target) => {
    target = $(target);
    let query = `[data-remodal-id="${target.closest('[data-remodal-id]').data('remodal-id')}"]`;

    return {
        title: type === 'title' ? $(target) : $(`${query} input[name="data[title]"]`),
        folder: type === 'folder' ? $(target) : $(`${query} input[name="data[folder]"]`)
    };
};

title.on('input focus blur', (event) => {
    if (custom) { return true; }
    let elements = getFields('title', event.currentTarget);

    let slug = $.slugify(elements.title.val());
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
    elements.folder.val(value);
    custom = !!value;

    // restore cursor position
    input.setSelectionRange(selection.start, selection.end);

});

folder.on('focus blur', (event) => getFields('title', event.currentTarget).title.trigger('input'));
