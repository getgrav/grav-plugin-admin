import $ from 'jquery';
import Finder from 'finderjs';
import { config } from 'grav-config';

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

            Finder(content[0], response.data, {
                labelKey: 'filename',
                createItemContent: createItemContent
            });

        }
    });
});

const createItemContent = (config, item) => {
    console.log(config, item);

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
};
