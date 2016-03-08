import $ from 'jquery';
import Map from 'es6-map';

const MOBILE_BREAKPOINT = 48 - 0.062;
const DESKTOP_BREAKPOINT = 75 + 0.063;
const EVENTS = 'touchstart._grav click._grav';
const TARGETS = '#titlebar h1 > .fa, #overlay';
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT}em)`;
const DESKTOP_QUERY = `(min-width: ${DESKTOP_BREAKPOINT}em)`;

let map = new Map();

export default class MobileSidebar {
    constructor() {
        this.isOpen = false;
        this.matchMedia = global.matchMedia(MOBILE_QUERY);
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

        overlay.css('display', 'block');
        sidebar.css('display', 'block').animate({
            opacity: 1
        }, 200, () => { this.isOpen = true; });
    }

    close(event) {
        event && event.preventDefault();
        let overlay = $('#overlay');
        let sidebar = $('#admin-sidebar');

        overlay.css('display', 'none');
        sidebar.animate({
            opacity: 0
        }, 200, () => {
            sidebar.css('display', 'none');
            this.isOpen = false;
        });
    }

    toggle(event) {
        event && event.preventDefault();
        return this[this.isOpen ? 'close' : 'open'](event);
    }

    toggleSidebarState() {
        event && event.preventDefault();
        let body = $('body');
        let isDesktop = global.matchMedia(DESKTOP_QUERY).matches;

        if (isDesktop && body.hasClass('sidebar-open')) {
            body.removeClass('sidebar-open');
        }

        if (!isDesktop && body.hasClass('sidebar-closed')) {
            body.removeClass('sidebar-closed');
        }

        body.toggleClass(`sidebar-${isDesktop ? 'closed' : 'open'}`);
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

export let Instance = new MobileSidebar();
