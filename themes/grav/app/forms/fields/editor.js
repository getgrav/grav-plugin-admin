import $ from 'jquery';
import Buttons, { strategies as buttonStrategies } from './editor/buttons';
import codemirror from 'codemirror';
import { watch } from 'watchjs';

// Modes
import 'codemirror/mode/css/css';
import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/php/php';
import 'codemirror/mode/sass/sass';
import 'codemirror/mode/twig/twig';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/yaml/yaml';

// Add-ons
import 'codemirror/addon/edit/continuelist';
import 'codemirror/addon/mode/overlay';

const ThemesMap = ['paper'];
const Defaults = {
    codemirror: {
        mode: 'htmlmixed',
        theme: 'paper',
        lineWrapping: true,
        dragDrop: true,
        autoCloseTags: true,
        matchTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        indentWithTabs: false,
        tabSize: 4,
        hintOptions: { completionSingle: false },
        extraKeys: { 'Enter': 'newlineAndIndentContinueMarkdownList' }
    }
};

export default class EditorField {
    constructor(options) {
        this.editors = $();
        this.options = Object.assign({}, Defaults, options);
        this.buttons = Buttons;
        this.buttonStrategies = buttonStrategies;

        watch(Buttons, (/* key, modifier, prev, next */) => {
            this.editors.each((index, editor) => $(editor).data('toolbar').renderButtons());
        });

        $('[data-grav-editor]').each((index, editor) => this.addEditor(editor));

        $('window').trigger('grav-editor-ready');
        $('body').on('mutation._grav', this._onAddedNodes.bind(this));
    }

    addButton(button, options) {
        if (options.before || options.after) {
            let index = this.buttons.navigation.findIndex((obj) => {
                let key = Object.keys(obj).shift();
                return obj[key].identifier === (options.before || options.after);
            });

            if (!~index) {
                options = 'end';
            } else {
                this.buttons.navigation.splice(options.before ? index : index + 1, 0, button);
            }

        }

        if (options === 'start') { this.buttons.navigation.splice(0, 0, button); }
        if (options === 'end') { this.buttons.navigation.push(button); }
    }

    addEditor(textarea) {
        textarea = $(textarea);
        let options = Object.assign(
            {},
            this.options.codemirror,
            textarea.data('grav-editor').codemirror
        );
        let theme = options.theme || 'paper';

        this.editors = this.editors.add(textarea);
        if (theme && !~ThemesMap.indexOf(theme)) {
            ThemesMap.push(theme);
            let themeCSS = `https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.12.0/theme/${theme}.min.css`;
            $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', themeCSS));
        }

        let editor = codemirror.fromTextArea(textarea.get(0), options);
        textarea.data('codemirror', editor);
        textarea.data('toolbar', new Toolbar(textarea));

        editor.on('change', () => editor.save());
    }

    _onAddedNodes(event, target/* , record, instance */) {
        let editors = $(target).find('[data-grav-editor]');
        if (!editors.length) { return; }

        editors.each((index, editor) => {
            editor = $(editor);
            if (!~this.editors.index(editor)) {
                this.addEditor(editor);
            }
        });
    }
}

export class Toolbar {
    static templates() {
        return {
            navigation: `
                <div class="grav-editor-toolbar">
                    <div class="grav-editor-actions"></div>
                    <div class="grav-editor-modes"></div>
                </div>
            `,
            states: `
                <div class="grav-editor-states">
                    <div class="grav-editor-info"></div>
                    <div class="grav-editor-modes"></div>
                </div>
            `
        };
    }

    constructor(editor) {
        this.editor = $(editor);
        this.codemirror = this.editor.data('codemirror');
        this.buttons = Buttons.navigation;
        this.ui = {
            navigation: $(Toolbar.templates().navigation),
            states: $(Toolbar.templates().states)
        };

        this.editor.parent('.grav-editor-content')
            .before(this.ui.navigation)
            .after(this.ui.states);

        this.renderButtons();
    }

    renderButtons() {
        this.ui.navigation.find('.grav-editor-actions').empty().append('<ul />');
        Buttons.navigation.forEach((button) => {
            Object.keys(button).forEach((key) => {
                let obj = button[key];
                let element = $(`<li class="grav-editor-button-${key}"><a class="hint--top" data-hint="${obj.title}" title="${obj.title}">${obj.label}</a></li>`);
                this.ui.navigation.find('.grav-editor-actions ul').append(element);

                obj.action && obj.action.call(obj.action, {
                    codemirror: this.codemirror,
                    button: element,
                    textarea: this.editor,
                    ui: this.ui
                });
            });
        });

        this.ui.navigation.find('.grav-editor-modes').empty().append('<ul />');
        Buttons.states.forEach((button) => {
            Object.keys(button).forEach((key) => {
                let obj = button[key];
                let element = $(`<li class="grav-editor-button-${key}"><a class="hint--top" data-hint="${obj.title}" title="${obj.title}">${obj.label}</a></li>`);
                this.ui.navigation.find('.grav-editor-modes ul').append(element);

                obj.action && obj.action.call(obj.action, {
                    codemirror: this.codemirror,
                    button: element,
                    textarea: this.editor,
                    ui: this.ui
                });
            });
        });
    }
}

export let Instance = new EditorField();
