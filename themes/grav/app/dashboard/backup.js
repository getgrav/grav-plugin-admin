import $ from 'jquery';
import { translations } from 'grav-config';
import request from '../utils/request';
import { Instances as Charts } from './chart';

$('[data-backup][data-ajax*="backup/"]').on('click', function() {
    let element = $(this);
    let url = element.data('ajax');
    const inDropdown = element.closest('.dropdown-menu');

    (inDropdown.length ? inDropdown : element)
        .closest('.button-group').find('> button:first')
        .attr('disabled', 'disabled')
        .find('> .fa').removeClass('fa-life-ring').addClass('fa-spin fa-refresh');

    request(url, (/* response */) => {
        if (Charts && Charts.backups) {
            Charts.backups.updateData({ series: [0, 100] });
            Charts.backups.element.find('.numeric').html(`0 <em>${translations.PLUGIN_ADMIN.DAYS.toLowerCase()}</em>`);
        }

        (inDropdown.length ? inDropdown : element)
            .closest('.button-group').find('> button:first')
            .removeAttr('disabled')
            .find('> .fa').removeClass('fa-spin fa-refresh').addClass('fa-life-ring');
    });
});

$('[data-backup][data-ajax*="backupDelete"]').on('click', function() {
    let element = $(this);
    let url = element.data('ajax');
    const tr = element.closest('tr');
    tr.addClass('deleting');

    request(url, (response) => {
        if (response.status === 'success') {
            tr.remove();
        } else {
            tr.removeClass('deleting');
        }
    });
});
