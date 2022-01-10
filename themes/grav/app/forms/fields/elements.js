import $ from 'jquery';

const enabled = '_enabled';
const disabled = '_disabled';

$(document).on('change', '[data-grav-elements] select', (event) => {
  const target = $(event.currentTarget);
  const value = target.val() === '1';
  const id = target.closest('[data-grav-elements]').data('gravElements');

  $(`[id="${id}_${enabled}"]`).css('display', value ? 'inherit' : 'none');
  $(`[id="${id}_${disabled}"]`).css('display', !value ? 'inherit' : 'none');
});
