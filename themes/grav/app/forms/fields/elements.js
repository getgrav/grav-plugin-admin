import $ from 'jquery';

$(document).on('change', '[data-grav-elements] select', (event) => {
  const target = $(event.currentTarget);
  const value = target.val();
  const id = target.closest('[data-grav-elements]').data('gravElements');

  $(`[id^="${id}_"]`).css('display', 'none');
  $(`[id="${id}__${value}"]`).css('display', 'inherit');
});
