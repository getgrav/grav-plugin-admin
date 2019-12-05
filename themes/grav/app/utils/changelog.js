/* eslint-disable */
import $ from 'jquery';

$(document).on('opened', '[data-remodal-id="changelog"]', (e) => {
    console.log(e);
    console.log(self);
    console.log('modal opened');
    const instance = $.remodal.lookup[$('[data-remodal-id=changelog]').data('remodal')];
    console.log(instance);
    console.log($trigger);
    const url = instance.$trigger.data('remodalChangelog');
    console.log(url);

    $.ajax({url: url}).done(function(data){
        console.log(data);
        instance.$modal.html(data);
    });
});
