import $ from 'jquery';
import { config } from 'grav-config';
import request from '../utils/request';

class Notifications {

    showNotificationInFeed(notification) {
        // console.log('notification in showNotificationInFeed');
        $('#notifications').removeClass('hidden');
        if (notification.link) {
            $('#notifications table').append(`
                <tr>
                    <td class="triple page-title">
                        <a href="${notification.link}">${notification.message}</a>
                    </td>
                    <td>${notification.date}</td>
                </tr>
            `);
        } else {
            $('#notifications table').append(`
                <tr>
                    <td class="triple page-title">${notification.message}</td>
                    <td>${notification.date}</td>
                </tr>
            `);
        }
    }

    showNotificationInTop(notification) {
        $('.top-notifications-container').removeClass('hidden');

        if (notification.link) {
            $('.top-notifications-container').append(`
                <div class="${notification.type} alert"><a href="${notification.link}">${notification.message}</a></div>
            `);
        } else {
            $('.top-notifications-container').append(`
                <div class="${notification.type} alert">${notification.message}</div>
            `);
        }
    }

    showNotificationInDashboard(notification) {
        $('.dashboard-notifications-container').removeClass('hidden');

        if (notification.link) {
            $('.dashboard-notifications-container').append(`
                <a href="${notification.link}">${notification.message}</a>
            `);
        } else {
            $('.dashboard-notifications-container').append(`
                ${notification.message}
            `);
        }
    }

    showNotificationInPlugins(notification) {
        $('.plugins-notifications-container').removeClass('hidden');

        if (notification.link) {
            $('.plugins-notifications-container').append(`
                <a href="${notification.link}">${notification.message}</a>
            `);
        } else {
            $('.plugins-notifications-container').append(`
                ${notification.message}
            `);
        }
    }

    showNotificationInThemes(notification) {
        $('.themes-notifications-container').removeClass('hidden');

        if (notification.link) {
            $('.themes-notifications-container').append(`
                <a href="${notification.link}">${notification.message}</a>
            `);
        } else {
            $('.themes-notifications-container').append(`
                ${notification.message}
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
        $.get('/notifications.json').then(function(response) {
            // console.log(response);

            request(`${config.base_url_relative}/notifications.json/task${config.param_sep}processNotifications`, {
                method: 'post',
                body: {'notifications': JSON.stringify(response)}
            }, (response) => {
                // console.warn(response);
                var notifications = response.notifications;

                if (notifications) {
                    notifications.forEach(function(notification) {
                        if (notification.location instanceof Array) {
                            notification.location.forEach(function(location) {
                                that.processLocation(location, notification);
                            });
                        } else {
                            that.processLocation(notification.location, notification);
                        }

                    });
                }
            });
        });
    }
}

var notifications = new Notifications();
export default notifications;

notifications.fetch();
