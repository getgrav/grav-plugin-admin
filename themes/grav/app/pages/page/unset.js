import $ from 'jquery';

$(document).on('click', '.dz-unset', function() {
    const dropzone = $(this).closest('[data-grav-file-settings]')[0].dropzone;
    $(this).closest('.dz-image-preview').remove();
    const file_upload = $('.files-upload');
    const unset_image = $(this).closest('.dz-image-preview').find('[data-dz-name]').text().trim();
    const images = JSON.parse(file_upload.find('input[data-grav-field="hidden"]').val()) || {};
    let image_array = {};

    $.each(images, function(ind, obj) {
        if (!ind.endsWith(unset_image)) {
            image_array[ind] = obj;
        }
    });

    const file = dropzone.files.filter((file) => file.name === unset_image).shift();

    if (dropzone.options.maxFiles === 1) {
        dropzone.removeFile(file);
    } else {
        const index = dropzone.files.indexOf(file);
        if (index !== -1) {
            dropzone.files.splice(index, 1);
        }

        if (!dropzone.files.length) {
            $(dropzone.previewsContainer).removeClass('dz-started');
        }
    }

    file_upload.find('input[data-grav-field="hidden"]').val(JSON.stringify(image_array));
});
