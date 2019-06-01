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
            route: btoa(field.val())
        },
        success(response) {
            loader.css('display', 'none');

            if (response.status === 'error') {
                content.html(response.message);
                return true;
            }

            Finder(content[0], response.data, {
                labelKey: 'filename'
            });

        }
    });
});

const createItemContent = (config, item) => {
    console.log(config, item);

    return document.createDocumentFragment();
};
