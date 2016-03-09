import $ from 'jquery';
import GeminiScrollbar from 'gemini-scrollbar';

const defaults = {
    autoshow: false,
    createElements: true,
    forceGemini: false
};

export default class Scrollbar {
    constructor(element, options) {
        this.element = $(element);
        if (!this.element.length) { return; }

        this.options = Object.assign({}, defaults, options, { element: this.element[0] });

        this.instance = new GeminiScrollbar(this.options).create();
        this.element.data('scrollbar', this.instance);
    }

    create() {
        this.instance.create();
    }

    update() {
        this.instance.update();
    }

    destroy() {
        this.instance.destroy();
    }
}

export let Instance = new Scrollbar('#admin-main .content-wrapper');

// $('[name="tab"]').on('touchstart click', () => Instance.update());
global.setInterval(() => { Instance.update(); }, 150);
