import $ from 'jquery';
import { config } from 'grav-config';
import request from '../utils/request';

class Notifications {

    showNotificationInFeed(notification) {
        // console.log('notification in showNotificationInFeed');
        $('#notifications').removeClass('hidden');
        if (notification.link) {
            $('#notifications table').append(`
                <tr class="single-notification">
                    <td class="triple page-title">
                        <a href="${notification.link}">${notification.message}</a>
                    </td>
                    <td>${notification.date}</td>
                    <td>${notification.closeButton}</td>
                </tr>
            `);
        } else {
            $('#notifications table').append(`
                <tr class="single-notification">
                    <td class="triple page-title">${notification.message}</td>
                    <td>${notification.date}</td>
                    <td>${notification.closeButton}</td>
                </tr>
            `);
        }
    }

    showNotificationInTop(notification) {
        $('.top-notifications-container').removeClass('hidden');

        if (notification.link) {
            $('.top-notifications-container').append(`
                <div class="single-notification ${notification.type} alert"><a href="${notification.link}">${notification.message}</a>
                ${notification.closeButton}</div>
            `);
        } else {
            $('.top-notifications-container').append(`
                <div class="single-notification ${notification.type} alert">${notification.message}
                ${notification.closeButton}</div>
            `);
        }
    }

    showNotificationInDashboard(notification) {
        $('.dashboard-notifications-container').removeClass('hidden');

        if (notification.link) {
            $('.dashboard-notifications-container').append(`
                <div class="single-notification ${notification.type}">
                <a href="${notification.link}">${notification.message}</a> ${notification.closeButton}
                </div>
            `);
        } else {
            $('.dashboard-notifications-container').append(`
                <div class="single-notification ${notification.type}">
                ${notification.message} ${notification.closeButton}
                </div>
            `);
        }
    }

    showNotificationInPlugins(notification) {
        $('.plugins-notifications-container').removeClass('hidden');

        if (notification.link) {
            $('.plugins-notifications-container').append(`
                <div class="single-notification ${notification.type}">
                <a href="${notification.link}">${notification.message}</a> ${notification.closeButton}
                </div>
            `);
        } else {
            $('.plugins-notifications-container').append(`
                <div class="single-notification ${notification.type}">
                ${notification.message} ${notification.closeButton}
                </div>
            `);
        }
    }

    showNotificationInThemes(notification) {
        $('.themes-notifications-container').removeClass('hidden');

        if (notification.link) {
            $('.themes-notifications-container').append(`
                <div class="single-notification ${notification.type}">
                <a href="${notification.link}">${notification.message}</a> ${notification.closeButton}
                </div>
            `);
        } else {
            $('.themes-notifications-container').append(`
                <div class="single-notification ${notification.type}">
                ${notification.message} ${notification.closeButton}
                </div>
            `);
        }
    }

    processLocation(location, notification) {
        switch (location) {
            case 'feed':
                this.showNotificationInFeed(notification);
                break;
            case 'top':
                this.showNotificationInTop(notification);
                break;
            case 'dashboard':
                this.showNotificationInDashboard(notification);
                break;
            case 'plugins':
                this.showNotificationInPlugins(notification);
                break;
            case 'themes':
                this.showNotificationInThemes(notification);
                break;
        }
    }

    // Grav.default.Notifications.fetch()
    fetch() {
        var that = this;

        var processNotifications = function processNotifications(response) {
            var notifications = response.notifications;

            if (notifications) {
                notifications.forEach(function(notification) {
                    notification.closeButton = `
                        <span class="">
                            <a href="#" data-notification-action="hide-notification" data-notification-id="${notification.id}" class="hide-notification"><i class="fa fa-close"></i></a>
                        </span>`;
                    if (notification.options && notification.options.indexOf('sticky') !== -1) {
                        notification.closeButton = '';
                    }

                    if (notification.location instanceof Array) {
                        notification.location.forEach(function(location) {
                            that.processLocation(location, notification);
                        });
                    } else {
                        that.processLocation(notification.location, notification);
                    }
                });
            }
        };

        $.get(`${config.base_url_relative}/notifications.json/task${config.param_sep}getNotifications/admin-nonce${config.param_sep}${config.admin_nonce}`).then(function(response) {
            if (response.need_update === true) {
                $.get('/notifications.json').then(function(response) {
                    request(`${config.base_url_relative}/notifications.json/task${config.param_sep}processNotifications`, {
                        method: 'post',
                        body: {'notifications': JSON.stringify(response)}
                    }, (response) => {
                        if (response.show_immediately === true) {
                            processNotifications(response);
                        }
                    });
                });
            }

            processNotifications(response);

        });
    }
}

var notifications = new Notifications();
export default notifications;

notifications.fetch();

$(document).on('click', '[data-notification-action="hide-notification"]', (event) => {
    let notification_id = $(event.target).parents('.hide-notification').data('notification-id');

    let url = `${config.base_url_relative}/notifications.json/task${config.param_sep}hideNotification/notification_id${config.param_sep}${notification_id}/admin-nonce${config.param_sep}${config.admin_nonce}`;

    request(url, () => {});

    $(event.target).parents('.single-notification').hide();
});
