import $ from 'jquery';

// Plugins sliders details
$('.gpm-name, .gpm-actions').on('click', function(e) {
    let element = $(this);
    let target = $(e.target);
    let tag = target.prop('tagName').toLowerCase();

    if (tag === 'a' || element.parent('a').length) { return true; }

    let wrapper = element.siblings('.gpm-details').find('.table-wrapper');

    wrapper.slideToggle({
        duration: 350,
        complete: () => {
            let visible = wrapper.is(':visible');
            wrapper
                .closest('tr')
                .find('.gpm-details-expand i')
                .removeClass('fa-chevron-' + (visible ? 'down' : 'up'))
                .addClass('fa-chevron-' + (visible ? 'up' : 'down'));
        }
    });
});
