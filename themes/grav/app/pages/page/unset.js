import $ from 'jquery';

$(document).on('click', '.dz-unset', function() {
    const file_upload = $(this).closest('.files-upload');
    const next_closest = $(this).closest('.dz-image-preview');
    const hidden_field = 'input[data-grav-field="hidden"]';
    if (next_closest.length) {
        const unset_image = next_closest.find('[data-dz-name]').text().trim();
        const images = JSON.parse(file_upload.find(hidden_field).val()) || null;
        let image_array = {};
        $.each(images, function(ind, obj) {
            if (!ind.endsWith(unset_image)) {
                image_array[ind] = obj;
            }
        });
        file_upload.find(hidden_field).val(JSON.stringify(image_array));
        next_closest.remove();
    }
});
