import $ from 'jquery';
import Scrollbar from '../../utils/scrollbar';

$(function() {
    let modal = '';
    let body = $('body');

    let treescroll = new Scrollbar('.pages-list-container .mediapicker-scroll', { autoshow: true });
    let thumbscroll = new Scrollbar('.thumbs-list-container .mediapicker-scroll', { autoshow: true });

    // Thumb Resizer
    $('.media-container .media-range').on('input change', function() {
        let cards = $('.media-container div.card-item');
        let width = $(this).val() + 'px';
        cards.each(function() {
            $(this).css('width', width);
        });
    });

    $(document).on('opened', '.remodal', function() {
        setTimeout(function() {
            treescroll.update();
            thumbscroll.update();
        }, 10);
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
