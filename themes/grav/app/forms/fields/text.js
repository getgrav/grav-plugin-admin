import $ from 'jquery';

$(document).ready(function() {
    $('.copy-to-clipboard').click(function(event) {
        var $tempElement = $('<input>');
        $('body').append($tempElement);
        $tempElement.val($(this).closest('.form-input-wrapper').find('input').val()).select();
        document.execCommand('Copy');
        $tempElement.remove();

        $(this).attr('data-hint', 'Copied to clipboard!').addClass('hint--left');
    });
});
