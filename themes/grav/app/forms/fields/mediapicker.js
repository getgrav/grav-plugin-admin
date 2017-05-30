import $ from 'jquery';
import Scrollbar from '../../utils/scrollbar';

$(function() {
    var modal = '';

    var treescroll = new Scrollbar('.pages-list-container .mediapicker-scroll', { autoshow: true });
    var thumbscroll = new Scrollbar('.thumbs-list-container .mediapicker-scroll', { autoshow: true });

    // Thumb Resizer
    $('.media-container .media-range').on('input change', function() {
        var cards = $('.media-container div.card-item');
        var width = $(this).val() + 'px';
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

    $('body').on('click', '[data-mediapicker-modal-trigger]', function() {
        var modal_identifier = $(this).data('grav-mediapicker-unique-identifier');
        var modal_element = $('body').find('[data-remodal-unique-identifier="' + modal_identifier + '"]');
        modal = $.remodal.lookup[modal_element.data('remodal')];
        modal.open();

        // load all media
        modal_element.find('.js__files').trigger('fillView');
    });

    /* handle media modal click actions */
    $('body').on('click', '[data-remodal-mediapicker] .media-container.in-modal .admin-media-details a', (event) => {
        event.preventDefault();
        event.stopPropagation();

        var val = $(event.target).parents('.js__media-element').data('file-url');
        var string = val.replace(/ /g, '%20');

        var modal_identifier = $(event.target).parents('[data-remodal-mediapicker]').data('remodal-unique-identifier');
        $('body').find('[data-grav-mediapicker-unique-identifier="' + modal_identifier + '"] input').val(string);

        modal.close();
    });
});
