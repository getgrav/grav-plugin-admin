import $ from 'jquery';
import '../../utils/cron-ui';
import { translations } from 'grav-config';

export default class CronField {
    constructor() {
        this.items = $();

        $('[data-grav-field="cron"]').each((index, cron) => this.addCron(cron));
        $('body').on('mutation._grav', this._onAddedNodes.bind(this));
    }

    addCron(cron) {
        cron = $(cron);
        this.items = this.items.add(cron);

        cron.find('.cron-selector').each((index, container) => {
            container = $(container);
            const input = container.closest('[data-grav-field]').find('input');

            container.jqCron({
                numeric_zero_pad: true,
                enabled_minute: true,
                multiple_dom: true,
                multiple_month: true,
                multiple_mins: true,
                multiple_dow: true,
                multiple_time_hours: true,
                multiple_time_minutes: true,
                default_period: 'hour',
                default_value: input.val() || '* * * * *',
                no_reset_button: false,
                bind_to: input,
                bind_method: {
                    set: function($element, value) {
                        $element.val(value);
                    }
                },
                texts: {
                    en: {
                        empty: translations.GRAV_CORE['CRON.EVERY'],
                        empty_minutes: translations.GRAV_CORE['CRON.EVERY'],
                        empty_time_hours: translations.GRAV_CORE['CRON.EVERY_HOUR'],
                        empty_time_minutes: translations.GRAV_CORE['CRON.EVERY_MINUTE'],
                        empty_day_of_week: translations.GRAV_CORE['CRON.EVERY_DAY_OF_WEEK'],
                        empty_day_of_month: translations.GRAV_CORE['CRON.EVERY_DAY_OF_MONTH'],
                        empty_month: translations.GRAV_CORE['CRON.EVERY_MONTH'],
                        name_minute: translations.GRAV_CORE['NICETIME.MINUTE'],
                        name_hour: translations.GRAV_CORE['NICETIME.HOUR'],
                        name_day: translations.GRAV_CORE['NICETIME.DAY'],
                        name_week: translations.GRAV_CORE['NICETIME.WEEK'],
                        name_month: translations.GRAV_CORE['NICETIME.MONTH'],
                        name_year: translations.GRAV_CORE['NICETIME.YEAR'],
                        text_period: translations.GRAV_CORE['CRON.TEXT_PERIOD'],
                        text_mins: translations.GRAV_CORE['CRON.TEXT_MINS'],
                        text_time: translations.GRAV_CORE['CRON.TEXT_TIME'],
                        text_dow: translations.GRAV_CORE['CRON.TEXT_DOW'],
                        text_month: translations.GRAV_CORE['CRON.TEXT_MONTH'],
                        text_dom: translations.GRAV_CORE['CRON.TEXT_DOM'],
                        error1: translations.GRAV_CORE['CRON.ERROR1'],
                        error2: translations.GRAV_CORE['CRON.ERROR2'],
                        error3: translations.GRAV_CORE['CRON.ERROR3'],
                        error4: translations.GRAV_CORE['CRON.ERROR4'],
                        weekdays: translations.GRAV_CORE['DAYS_OF_THE_WEEK'],
                        months: translations.GRAV_CORE['MONTHS_OF_THE_YEAR']
                    }
                }
            });
        });
    }

    _onAddedNodes(event, target/* , record, instance */) {
        let crons = $(target).find('[data-grav-field="cron"]');
        if (!crons.length) { return; }

        crons.each((index, list) => {
            list = $(list);
            if (!~this.items.index(list)) {
                this.addCron(list);
            }
        });
    }
}

export let Instance = new CronField();
