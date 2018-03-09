import $ from 'jquery';

$(document).on('click', '.dz-unset', function() {
    $(this).closest('.dz-image-preview').remove();
    var unsetimage = $(this).closest('.dz-image-preview').find('img').attr('src');
    var images = $('.files-upload').find('input[data-grav-field=\'hidden\']').val();
    var imagearray = {};
    $.each($.parseJSON(images), function(ind, obj) {
        console.log(ind, obj);
        if ('/' + ind !== unsetimage) {
            imagearray[ind] = obj;
        }
    });
    $('.files-upload').find('input[data-grav-field="hidden"]').val(JSON.stringify(imagearray));
});
