import $ from 'jquery';
import { config } from 'grav-config';
import request from '../utils/request';

class Notifications {

    showNotificationInFeed(notification, index) {
        $('#notifications').removeClass('hidden');

        if (!notification.type) {
            notification.type = 'note';
        }

        switch (notification.type) {
            case 'note':
                notification.intro_text = 'Note';
                break;
            case 'info':
                notification.intro_text = 'Info';
                break;
            case 'warning':
                notification.intro_text = 'Warning';
                break;
        }

        var hidden = '';
        if (index > 9) {
            hidden = ' hidden ';
        }

        if (notification.link) {
            $('#notifications ul').append(`
                <li class="single-notification ${hidden}">
                    <span class="badge alert ${notification.type}">${notification.intro_text}</span>
                    <a target="_blank" href="${notification.link}">${notification.message}</a>
                </li>
            `);
        } else {
            $('#notifications ul').append(`
                <li class="single-notification ${hidden}">
                    <span class="badge alert ${notification.type}">${notification.intro_text}</span>
                    ${notification.message}
                </li>
            `);
        }
    }

    addShowAllInFeed() {
        $('#notifications ul').append(`
            <li class="show-all" data-notification-action="show-all-notifications">Show all</li>
        `);
    }

    showNotificationInTop(notification) {
        let element;

        if (notification.link) {
            element = $(`<div class="single-notification ${notification.type} alert">
                <a target="_blank" href="${notification.link}">${notification.message}</a>
                ${notification.closeButton}
                </div>`);

        } else {
            element = $(`<div class="single-notification ${notification.type} alert">
                ${notification.message}
                ${notification.closeButton}
                </div>`);
        }

        element.hide();
        $('.top-notifications-container').removeClass('hidden').addClass('default-box-shadow').append(element);
        element.slideDown(150);
    }

    showNotificationInDashboard(notification) {
        let element;

        if (notification.link) {
            element = $(`<div class="single-notification ${notification.type}">
                <a target="_blank" href="${notification.link}">${notification.message}</a>
                ${notification.closeButton}
                </div>`);
        } else {
            element = $(`<div class="single-notification ${notification.type}">
                ${notification.message}
                ${notification.closeButton}
                </div>`);
        }

        element.hide();
        $('.dashboard-notifications-container').removeClass('hidden').append(element);
        element.slideDown(150);
    }

    showNotificationInPlugins(notification) {
        let element;

        if (notification.link) {
            element = $(`<div class="single-notification ${notification.type}">
                <a target="_blank" href="${notification.link}">${notification.message}</a>
                ${notification.closeButton}
                </div>`);
        } else {
            element = $(`<div class="single-notification ${notification.type}">
                ${notification.message} ${notification.closeButton}
                </div>`);
        }

        element.hide();
        $('.plugins-notifications-container').removeClass('hidden').append(element);
        element.slideDown(150);
    }

    showNotificationInThemes(notification) {
        let element;

        if (notification.link) {
            element = $(`<div class="single-notification ${notification.type}">
                <a target="_blank" href="${notification.link}">${notification.message}</a>
                ${notification.closeButton}
                </div>`);
        } else {
            element = $(`<div class="single-notification ${notification.type}">
                ${notification.message}
                ${notification.closeButton}
                </div>`);
        }

        element.hide();
        $('.themes-notifications-container').removeClass('hidden').append(element);
        element.slideDown(150);
    }

    processLocation(location, notification, index = 0) {
        switch (location) {
            case 'feed':
                this.showNotificationInFeed(notification, index);
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
                var index = 0;

                notifications.forEach(function(notification) {
                    notification.closeButton = `<a href="#" data-notification-action="hide-notification" data-notification-id="${notification.id}" class="close hide-notification"><i class="fa fa-close"></i></a>`;
                    if (notification.options && notification.options.indexOf('sticky') !== -1) {
                        notification.closeButton = '';
                    }

                    if (notification.location instanceof Array) {
                        notification.location.forEach(function(location) {
                            if (location === 'feed') {
                                that.processLocation(location, notification, index);
                                index++;
                            } else {
                                that.processLocation(location, notification);
                            }

                        });
                    } else {
                        that.processLocation(notification.location, notification);
                    }
                });

                if (index > 10) {
                    that.addShowAllInFeed();
                }
            }
        };

        request(`${config.base_url_relative}/notifications.json/task${config.param_sep}getNotifications`, { method: 'post' }, (response) => {
            if (response.need_update === true) {
                $.get('/notifications.json').then(function(response) {
                    request(`${config.base_url_relative}/notifications.json/task${config.param_sep}processNotifications`, {
                        method: 'post',
                        body: { 'notifications': JSON.stringify(response) }
                    }, (response) => {
                        if (response.show_immediately === true) {
                            processNotifications(response);
                        }
                    });
                }).fail(function() { console.log('Failed getting notifications'); });
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

    let url = `${config.base_url_relative}/notifications.json/task${config.param_sep}hideNotification/notification_id${config.param_sep}${notification_id}`;

    request(url, { method: 'post' }, () => {});

    $(event.target).parents('.single-notification').hide();
});

$(document).on('click', '[data-notification-action="show-all-notifications"]', (event) => {
    $('#notifications .show-all').hide();
    $('#notifications .hidden').removeClass('hidden');
});
