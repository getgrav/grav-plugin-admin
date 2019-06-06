/**
 * (c) Trilby Media, LLC
 * Author Djamil Legato
 *
 * Based on Mark Matyas's Finderjs
 * MIT License
 */

import $ from 'jquery';
import EventEmitter from 'eventemitter3';

export const DEFAULTS = {
    labelKey: 'name',
    valueKey: 'value', // new
    childKey: 'children',
    iconKey: 'icon', // new
    itemKey: 'item-key', // new
    className: {
        container: 'fjs-container',
        col: 'fjs-col',
        list: 'fjs-list',
        item: 'fjs-item',
        active: 'fjs-active',
        children: 'fjs-has-children',
        url: 'fjs-url',
        itemPrepend: 'fjs-item-prepend',
        itemContent: 'fjs-item-content',
        itemAppend: 'fjs-item-append'
    }
};

class Finder {
    constructor(container, data, options) {
        this.$emitter = new EventEmitter();
        this.container = $(container);
        this.data = data;

        this.config = $.extend({}, DEFAULTS, options);

        // dom events
        this.container.on('click', this.clickEvent.bind(this));
        this.container.on('keydown', this.keydownEvent.bind(this));

        // internal events
        this.$emitter.on('item-selected', this.itemSelected.bind(this));
        this.$emitter.on('create-column', this.addColumn.bind(this));
        this.$emitter.on('navigate', this.navigate.bind(this));
        this.$emitter.on('go-to', this.goTo.bind(this, this.data));

        this.container.addClass(this.config.className.container).attr('tabindex', 0);

        this.createColumn(this.data);

        if (this.config.defaultPath) {
            this.goTo(this.data, this.config.defaultPath);
        }
    }

    createColumn(data, parent) {
        const callback = (data) => this.createColumn(data, parent);

        if (typeof data === 'function') {
            data.call(this, parent, callback);
        } else if (Array.isArray(data) || typeof data === 'object') {
            if (typeof data === 'object') {
                data = Array.from(data);
            }
            const list = this.createList(data);
            const div = $('<div />');
            div.append(list).addClass(this.config.className.col);
            this.$emitter.emit('create-column', div);

            return div;
        } else {
            throw new Error('Unknown data type');
        }
    }

    clickEvent(event) {
        event.stopPropagation();
        event.preventDefault();

        const target = $(event.target);
        const column = target.closest(`.${this.config.className.col}`);
        const item = target.closest(`.${this.config.className.item}`);

        if (item) {
            this.$emitter.emit('item-selected', { column, item });
        }
    }

    keydownEvent(event) {
        const codes = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

        if (event.keyCode in codes) {
            event.stopPropagation();
            event.preventDefault();

            this.$emitter.emit('navigate', {
                direction: codes[event.keyCode]
            });
        }
    }

    itemSelected(value) {
        const element = value.item;
        const item = element[0]._item;
        const column = value.column;
        const data = item[this.config.childKey] || this.data;
        const active = $(column).find(`.${this.config.className.active}`);

        if (active.length) {
            active.removeClass(this.config.className.active);
        }

        element.addClass(this.config.className.active);
        column.nextAll().remove(); // ?!?!?

        this.container[0].focus();
        window.scrollTo(window.pageXOffset, window.pageYOffset);

        let newColumn;
        if (data) {
            newColumn = this.createColumn(data, item);
            this.$emitter.emit('interior-selected', item);
        } else {
            this.$emitter.emit('leaf-selected', item);
        }

        return newColumn;
    }

    addColumn(column) {
        this.container.append(column);
        this.$emitter.emit('column-created', column);
    }

    navigate(value) {
        const active = this.findLastActive();
        const direction = value.direction;
        let column;
        let item;
        let target;

        if (active) {
            item = active.item;
            column = active.column;

            if (direction === 'up' && item.prev().length) {
                target = item.prev();
            } else if (direction === 'down' && item.next().length) {
                target = item.next();
            } else if (direction === 'right' && column.next().length) {
                column = column.next();
                target = column.find(`.${this.config.className.item}`);
            } else if (direction === 'left' && column.prev().length) {
                column = column.prev();
                target = column.find(`.${this.config.className.active}`).first() || column.find(`.${this.config.className.item}`);
            }
        } else {
            column = this.container.find(`.${this.config.className.col}`).first();
            target = column.find(`.${this.config.className.item}`).first();
        }

        if (target) {
            this.$emitter.emit('item-selected', {
                column,
                item: target
            });
        }
    }

    goTo(data, path) {
        path = Array.isArray(path) ? path : path.split('/').map(bit => bit.trim()).filter(Boolean);

        if (path.length) {
            this.container.children().each((index, child) => $(child).remove());
        }

        if (typeof data === 'function') {
            data.call(this, null, (data) => this.selectPath(path, data));
        } else {
            this.selectPath(path, data);
        }
    }

    selectPath(path, data, column) {
        column = column || this.createColumn(data);

        const current = path[0];
        const children = data.find((item) => item[this.config.itemKey] === current);
        const newColumn = this.itemSelected({
            column,
            item: column.find(`[data-fjs-item="${current}"]`).first()
        });

        path.shift();

        if (path.length) {
            this.selectPath(path, children[this.config.childKey], newColumn);
        }
    }

    findLastActive() {
        const active = this.container.find(`.${this.config.className.active}`);
        if (!active.length) {
            return null;
        }

        const item = active.last();
        const column = item.closest(`.${this.config.className.col}`);

        return { item, column };
    }

    createList(data) {
        const list = $('<ul />');
        const items = data.map((item) => this.createItem(item));

        const fragments = items.reduce((fragment, current) => {
            fragment.appendChild(current[0] || current);

            return fragment;
        }, document.createDocumentFragment());

        list.append(fragments).addClass(this.config.className.list);

        return list;
    }

    createItem(item) {
        const listItem = $('<li />');
        const listItemClasses = [this.config.className.item];
        const link = $('<a />');
        const createItemContent = this.config.createItemContent || this.createItemContent;
        const fragment = createItemContent.call(this, item);
        link.append(fragment)
            .attr('href', '')
            .attr('tabindex', -1);

        if (item.url) {
            link.attr('href', item.url);
            listItemClasses.push(item.className);
        }

        if (item[this.config.childKey]) {
            listItemClasses.push(this.config.className[this.config.childKey]);
        }

        listItem.addClass(listItemClasses.join(' '));
        listItem.append(link)
            .attr('data-fjs-item', item[this.config.itemKey]);

        listItem[0]._item = item;

        return listItem;
    }
}

export default Finder;
