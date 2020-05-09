import $ from 'jquery';
import { Instance as pagesTree } from '../../pages/tree';

$(function() {
    let modal = '';
    let body = $('body');

    // Thumb Resizer
    $(document).on('input change', '.media-container .media-range', function(event) {
        const target = $(event.currentTarget);
        const container = target.closest('.remodal');
        let cards = container.find('.media-container div.card-item');
        let width = target.val() + 'px';
        cards.each(function() {
            $(this).css('width', width);
        });
    });

    body.on('click', '[data-mediapicker-modal-trigger]', function(event) {
        const element = $(event.currentTarget);
        let modal_identifier = $(this).data('grav-mediapicker-unique-identifier');
        let modal_element = body.find(`[data-remodal-unique-identifier="${modal_identifier}"]`);
        modal = $.remodal.lookup[modal_element.data('remodal')];

        if (!modal) {
            modal_element.remodal();
            modal = $.remodal.lookup[modal_element.data('remodal')];
        }

        modal.open();
        modal.dataField = element.find('input');

        // load all media
        modal_element.find('.js__files').trigger('fillView');

        setTimeout(() => pagesTree.reload(), 100);
    });

    /* handle media modal click actions */
    body.on('click', '[data-remodal-mediapicker] .media-container.in-modal .admin-media-details a', (event) => {
        event.preventDefault();
        event.stopPropagation();

        let val = $(event.target).parents('.js__media-element').data('file-url');
        let string = val.replace(/ /g, '%20');

        modal.dataField.val(string);

        modal.close();
    });
});
