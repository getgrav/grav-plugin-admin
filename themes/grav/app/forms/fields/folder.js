import $ from 'jquery';

const Regenerate = (field = '[name="data[folder]"]') => {
    const element = $(field);
    const title = $('[name="data[header][title]"]');
    const slug = $.slugify(title.val(), {custom: {"'": ''}});

    element.addClass('highlight').val(slug);

    setTimeout(() => element.removeClass('highlight'), 500);
};

$(document).on('click', '[data-regenerate]', (event) => {
    const target = $(event.currentTarget);
    const field = $(target.data('regenerate'));

    Regenerate(field);
});

export default Regenerate;
