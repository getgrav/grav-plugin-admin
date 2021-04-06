import $ from 'jquery';

$(document).on('input', '[type="range"].rangefield, [type="number"].rangefield', (event) => {
    const target = $(event.currentTarget);
    const type = target.attr('type').toLowerCase();
    const sibling = type === 'range' ? 'number' : 'range';
    const feedback = target.siblings(`[type="${sibling}"].rangefield`);

    feedback.val(target.val());
});
