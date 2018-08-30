import $ from 'jquery';
import cron from 'jquery-cron';

$(function() {

    $(document).ready(function() {
        $('.cron-field').cron(); // apply cron with default options
    });

}
