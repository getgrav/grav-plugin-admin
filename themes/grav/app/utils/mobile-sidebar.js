import $ from 'jquery';
import Map from 'es6-map';

const BREAKPOINT = 48 - 0.062;
const EVENTS = 'touchstart._grav click._grav';
const TARGETS = '#titlebar h1 > .fa, #overlay';
const QUERY = `(max-width: ${BREAKPOINT}em)`;

let map = new Map();

export default class MobileSidebar {
    constructor() {
        this.isOpen = false;
        this.matchMedia = global.matchMedia(QUERY);
        this.enable();
    }

    enable() {
        this.matchMedia.addListener(this._getBound('checkMatch'));
        this.checkMatch(this.matchMedia);
    }

    disable() {
        this.close();
        this.matchMedia.removeListener(this._getBound('checkMatch'));
    }

    attach() {
        $('body').on(EVENTS, TARGETS, this._getBound('toggle'));
    }

    detach() {
        $('body').off(EVENTS, TARGETS, this._getBound('toggle'));
    }

    open(event) {
        event && event.preventDefault();

        $('#overlay').css('display', 'block');
        $('#admin-sidebar').css('display', 'block').animate({
            opacity: 1
        }, 200, () => { this.isOpen = true; });
    }

    close(event) {
        event && event.preventDefault();

        $('#overlay').css('display', 'none');
        $('#admin-sidebar').animate({
            opacity: 0
        }, 200, () => {
            $('#admin-sidebar').css('display', 'none');
            this.isOpen = false;
        });
    }

    toggle(event) {
        event && event.preventDefault();
        return this[this.isOpen ? 'close' : 'open'](event);
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
