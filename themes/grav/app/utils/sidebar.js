import $ from 'jquery';
import Scrollbar from './scrollbar';
import Map from 'es6-map';

const MOBILE_BREAKPOINT = 48 - 0.062;
const DESKTOP_BREAKPOINT = 75 + 0.063;
const EVENTS = 'touchstart._grav click._grav';
const TARGETS = '[data-sidebar-mobile-toggle], #overlay';
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT}em)`;
const DESKTOP_QUERY = `(min-width: ${DESKTOP_BREAKPOINT}em)`;

let map = new Map();

export default class Sidebar {
    constructor() {
        this.isOpen = false;
        this.matchMedia = global.matchMedia(MOBILE_QUERY);
        this.scroller = new Scrollbar('#admin-menu', { autoshow: true });
        this.enable();
    }

    enable() {
        this.matchMedia.addListener(this._getBound('checkMatch'));
        this.checkMatch(this.matchMedia);
        $('body').on(EVENTS, '[data-sidebar-toggle]', this._getBound('toggleSidebarState'));
    }

    disable() {
        this.close();
        this.matchMedia.removeListener(this._getBound('checkMatch'));
        $('body').off(EVENTS, '[data-sidebar-toggle]', this._getBound('toggleSidebarState'));
    }

    attach() {
        $('body').on(EVENTS, TARGETS, this._getBound('toggle'));
    }

    detach() {
        $('body').off(EVENTS, TARGETS, this._getBound('toggle'));
    }

    open(event) {
        event && event.preventDefault();
        let overlay = $('#overlay');
        let sidebar = $('#admin-sidebar');

        $('body').addClass('sidebar-mobile-open');
        overlay.css('display', 'block');
        sidebar.css('display', 'block').animate({
            opacity: 1
        }, 200, () => { this.isOpen = true; });

        $('#admin-menu').data('scrollbar').update();
    }

    close(event) {
        event && event.preventDefault();
        let overlay = $('#overlay');
        let sidebar = $('#admin-sidebar');

        $('body').removeClass('sidebar-mobile-open');
        overlay.css('display', 'none');
        sidebar.animate({
            opacity: 0
        }, 200, () => {
            sidebar.css('display', 'none');
            this.isOpen = false;
        });

        $('#admin-menu').data('scrollbar').update();
    }

    toggle(event) {
        event && event.preventDefault();
        return this[this.isOpen ? 'close' : 'open'](event);
    }

    toggleSidebarState() {
        event && event.preventDefault();
        let body = $('body');
        let isDesktop = global.matchMedia(DESKTOP_QUERY).matches;

        if (isDesktop) {
            body.removeClass('sidebar-open');
        }

        if (!isDesktop) {
            body.removeClass('sidebar-closed');
            body.removeClass('sidebar-mobile-open');
        }

        body.toggleClass(`sidebar-${isDesktop ? 'closed' : 'open'}`);
        $(global).trigger('sidebar_state._grav', isDesktop);
    }

    checkMatch(data) {
        let sidebar = $('#admin-sidebar');
        let overlay = $('#overlay');
        this.isOpen = false;

        overlay.css('display', 'none');
        sidebar.css({
            display: data.matches ? 'none' : 'inherit',
            opacity: data.matches ? 0 : 1
        });

        if (data.matches) {
            $('body').removeClass('sidebar-open sidebar-closed');
        }

        this[data.matches ? 'attach' : 'detach']();
    }

    _getBound(fn) {
        if (map.has(fn)) {
            return map.get(fn);
        }

        return map.set(fn, this[fn].bind(this)).get(fn);
    }
}

export let Instance = new Sidebar();
