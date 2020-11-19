import $ from 'jquery';
import { translations } from 'grav-config';
import formatBytes from '../utils/formatbytes';
import request from '../utils/request';
import { Instance as Update } from './index';

// Dashboard update and Grav update
$(document).on('click.remodal', '[data-remodal-id="update-grav"] [data-remodal-action="confirm"]', () => {
    const element = $('#grav-update-button');
    element.html(`${translations.PLUGIN_ADMIN.UPDATING_PLEASE_WAIT} ${formatBytes(Update.payload.grav.assets['grav-update'].size)}..`);

    element.attr('disabled', 'disabled').find('> .fa').removeClass('fa-cloud-download').addClass('fa-refresh fa-spin');

    request(Update.updateURL, (response) => {
        if (response.type === 'updategrav') {
            $('[data-gpm-grav]').remove();
            $('#footer .grav-version').html(response.version);
        }

        element.removeAttr('disabled').find('> .fa').removeClass('fa-refresh fa-spin').addClass('fa-cloud-download');
    });
});
