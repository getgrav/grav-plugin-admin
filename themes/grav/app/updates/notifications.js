import $ from 'jquery';
import { config } from 'grav-config';
import request from '../utils/request';

const canFetchNotifications = () => config.notifications.enabled;
const notificationsFilters = () => config.notifications.filters;

class Notifications {

    static addShowAllInFeed() {
        $('#notifications ul').append('<li class="show-all" data-notification-action="show-all-notifications">Show all</li>');
    }

    static showNotificationInFeed(notification) {
        let notifications = $('#notifications').removeClass('hidden');

        let loader = notifications.find('.widget-loader').hide();
        let content = notifications.find('.widget-content > ul').show();
        loader.find('div').remove();
        loader.find('.fa-warning').removeClass('fa-warning').addClass('fa-refresh fa-spin');

        content
            .append(notification)
            .find('li:nth-child(n+11)').addClass('hidden'); // hide all items > 10

        if (content.find('li.hidden').length) {
            Notifications.addShowAllInFeed();
        }
    }

    static showNotificationInTop(notification) {
        const container = $('.top-notifications-container');
        const dummy = $('<div />').html(notification);

        container.removeClass('hidden').append(dummy.children());
        dummy.children().slideDown(150);
    }

    static showNotificationInDashboard(notification) {
        const container = $('.dashboard-notifications-container');
        const dummy = $('<div />').html(notification);

        container.removeClass('hidden').append(dummy.children());
        dummy.children().slideDown(150);
    }

    static showNotificationInPlugins(notification) {
        const container = $('.plugins-notifications-container');
        const dummy = $('<div />').html(notification);

        container.removeClass('hidden').append(dummy.children());
        dummy.children().slideDown(150);
    }

    static showNotificationInThemes(notification) {
        const container = $('.themes-notifications-container');
        const dummy = $('<div />').html(notification);

        container.removeClass('hidden').append(dummy.children());
        dummy.children().slideDown(150);
    }

    static processLocation(location, notification) {
        switch (location) {
            case 'feed':
                Notifications.showNotificationInFeed(notification);
                break;
            case 'top':
                if (!notification.read) {
                    Notifications.showNotificationInTop(notification);
                }
                break;
            case 'dashboard':
                if (!notification.read) {
                    Notifications.showNotificationInDashboard(notification);
                }
                break;
            case 'plugins':
                if (!notification.read) {
                    Notifications.showNotificationInPlugins(notification);
                }
                break;
            case 'themes':
                if (!notification.read) {
                    Notifications.showNotificationInThemes(notification);
                }
                break;
        }
    }

    // Grav.default.Notifications.fetch()
    fetch({ filter = notificationsFilters(), refresh = false } = {}) {
        if (!canFetchNotifications()) {
            return false;
        }

        let feed = $('#notifications');
        let loader = feed.find('.widget-loader');
        let content = feed.find('.widget-content > ul');
        loader.find('div').remove();
        loader.find('.fa-warning').removeClass('fa-warning').addClass('fa-refresh fa-spin');
        loader.show();
        content.hide();

        let processNotifications = (response) => {
            let notifications = response.notifications;

            $('#notifications').find('.widget-content > ul').empty();

            if (notifications) {
                Object.keys(notifications).forEach((location) => Notifications.processLocation(location, notifications[location]));
            }
        };

        request(`${config.base_url_relative}/task${config.param_sep}getNotifications`, {
            method: 'post',
            body: { refresh, filter }
        }, (response) => {
            processNotifications(response);
        }).catch(() => {
            let widget = $('#notifications .widget-content');
            widget
                .find('.widget-loader')
                .find('div').remove();

            widget
                .find('.widget-loader')
                .append('<div>Failed to retrieve notifications</div>')
                .find('.fa-spin')
                .removeClass('fa-spin fa-refresh').addClass('fa-warning');
        });
    }
}

let notifications = new Notifications();
export default notifications;

if (canFetchNotifications()) {
    notifications.fetch();

    /* Hide a notification and store it hidden
    // <a href="#" data-notification-action="hide-notification" data-notification-id="${notification.id}" class="close hide-notification"><i class="fa fa-close"></i></a>
    $(document).on('click', '[data-notification-action="hide-notification"]', (event) => {
        let notification_id = $(event.target).parents('.hide-notification').data('notification-id');

        let url = `${config.base_url_relative}/notifications.json/task${config.param_sep}hideNotification/notification_id${config.param_sep}${notification_id}`;

        request(url, { method: 'post' }, () => {});

        $(event.target).parents('.single-notification').hide();
    });
    */

    $(document).on('click', '[data-notification-action="hide-notification"]', (event) => {
        const target = $(event.currentTarget);
        const notification = target.parent();

        notification.slideUp(() => notification.remove());
    });

    $(document).on('click', '[data-notification-action="show-all-notifications"]', (event) => {
        $('#notifications .show-all').hide();
        $('#notifications .hidden').removeClass('hidden');
    });

    $(document).on('click', '[data-refresh="notifications"]', (event) => {
        event.preventDefault();
        notifications.fetch({ filter: ['feed'], refresh: true });
    });
}
