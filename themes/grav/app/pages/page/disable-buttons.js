import $ from 'jquery';

$('button[value="save"]').on('click', function() {
    $(this).addClass('pointer-events-disabled');
});
