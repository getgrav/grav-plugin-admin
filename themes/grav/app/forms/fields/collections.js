import $ from 'jquery';
import Sortable from 'sortablejs';
import '../../utils/jquery-utils';

export default class CollectionsField {
    constructor() {
        this.lists = $();

        $('[data-type="collection"]').each((index, list) => this.addList(list));
        $('body').on('mutation._grav', this._onAddedNodes.bind(this));

    }

    addList(list) {
        list = $(list);
        this.lists = this.lists.add(list);

        list.on('click', '> .collection-actions [data-action="add"]', (event) => this.addItem(event));
        list.on('click', '> ul > li > .item-actions [data-action="delete"]', (event) => this.removeItem(event));
        list.on('input', '[data-key-observe]', (event) => this.observeKey(event));

        list.find('[data-collection-holder]').each((index, container) => {
            container = $(container);
            if (container.data('collection-sort') || container[0].hasAttribute('data-collection-nosort')) { return; }

            container.data('collection-sort', new Sortable(container.get(0), {
                forceFallback: false,
                animation: 150,
                filter: '.CodeMirror, .grav-editor-resizer',
                onUpdate: () => this.reindex(container)
            }));
        });
    }

    addItem(event) {
        let button = $(event.currentTarget);
        let list = button.closest('[data-type="collection"]');
        let template = $(list.find('> [data-collection-template="new"]').data('collection-template-html'));

        list.find('> [data-collection-holder]').append(template);
        this.reindex(list);

        // refresh toggleables in a list
        $('[data-grav-field="toggleable"] input[type="checkbox"]').trigger('change');
    }

    removeItem(event) {
        let button = $(event.currentTarget);
        let item = button.closest('[data-collection-item]');
        let list = button.closest('[data-type="collection"]');

        item.remove();
        this.reindex(list);
    }

    observeKey(event) {
        let input = $(event.target);
        let value = input.val();
        let item = input.closest('[data-collection-key]');

        item.data('collection-key-backup', item.data('collection-key')).data('collection-key', value);
        this.reindex(null, item);
    }

    reindex(list, items) {
        items = items || $(list).closest('[data-type="collection"]').find('> ul > [data-collection-item]');

        items.each((index, item) => {
            item = $(item);
            let observed = item.find('[data-key-observe]');
            let observedValue = observed.val();
            let hasCustomKey = observed.length;
            let currentKey = item.data('collection-key-backup');

            item.attr('data-collection-key', hasCustomKey ? observedValue : index);

            ['name', 'data-grav-field-name', 'for', 'id'].forEach((prop) => {
                item.find('[' + prop + '], [_' + prop + ']').each(function() {
                    let element = $(this);
                    let indexes = [];
                    let regexps = [
                        new RegExp('\\[(\\d+|\\*|' + currentKey + ')\\]', 'g'),
                        new RegExp('\\.(\\d+|\\*|' + currentKey + ')\\.', 'g')
                    ];

                    if (hasCustomKey && !observedValue) {
                        element.attr(`_${prop}`, element.attr(prop));
                        element.attr(prop, null);
                        return;
                    }

                    if (element.attr(`_${prop}`)) {
                        element.attr(prop, element.attr(`_${prop}`));
                        element.attr(`_${prop}`, null);
                    }

                    element.parents('[data-collection-key]').map((idx, parent) => indexes.push($(parent).attr('data-collection-key')));
                    indexes.reverse();

                    let replaced = element.attr(prop).replace(regexps[0], (/* str, p1, offset */) => {
                        return `[${indexes.shift() || currentKey}]`;
                    });

                    replaced = replaced.replace(regexps[1], (/* str, p1, offset */) => {
                        return `.${indexes.shift()}.`;
                    });

                    element.attr(prop, replaced);
                });
            });
        });
    }

    _onAddedNodes(event, target/* , record, instance */) {
        let collections = $(target).find('[data-type="collection"]');
        if (!collections.length) { return; }

        collections.each((index, collection) => {
            collection = $(collection);
            if (!~this.lists.index(collection)) {
                this.addList(collection);
            }
        });
    }
}

export let Instance = new CollectionsField();
