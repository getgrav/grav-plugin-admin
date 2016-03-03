import $ from 'jquery';
import '../../utils/jquery-utils';

let custom = false;
let folder = $('[data-remodal-id="modular"] input[name="folder"]');
let title = $('[data-remodal-id="modular"] input[name="title"]');

title.on('input focus blur', () => {
    if (custom) { return true; }

    let slug = $.slugify(title.val());
    folder.val(slug);
});

folder.on('input', () => {
    let input = folder.get(0);
    let value = folder.val();
    let selection = {
        start: input.selectionStart,
        end: input.selectionEnd
    };

    value = value.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9_\-]/g, '');
    folder.val(value);
    custom = !!value;

    // restore cursor position
    input.setSelectionRange(selection.start, selection.end);

});

folder.on('focus blur', () => title.trigger('input'));
