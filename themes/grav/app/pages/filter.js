import $ from 'jquery';
import { config } from 'grav-config';
import request from '../utils/request';
import debounce from 'debounce';
import { Instance as pagesTree } from './tree';
import 'selectize';
import '../utils/storage';

/* @formatter:off */
/* eslint-disable */
const options = [
    { flag: 'Modular',       key: 'Modular',      cat: 'mode' },
    { flag: 'Visible',       key: 'Visible',      cat: 'mode' },
    { flag: 'Routable',      key: 'Routable',     cat: 'mode' },
    { flag: 'Published',     key: 'Published',    cat: 'mode' },
    { flag: 'Non-Modular',   key: 'NonModular',   cat: 'mode' },
    { flag: 'Non-Visible',   key: 'NonVisible',   cat: 'mode' },
    { flag: 'Non-Routable',  key: 'NonRoutable',  cat: 'mode' },
    { flag: 'Non-Published', key: 'NonPublished', cat: 'mode' }
];
/* @formatter:on */
/* eslint-enable */

export default class PagesFilter {
    constructor(filters, search) {
        this.filters = $(filters);
        this.search = $(search);
        this.options = options;
        this.tree = pagesTree;
        let storage = JSON.parse(localStorage.getItem('grav:admin:pages:filter') || '{}');

        if (!this.filters.length || !this.search.length) { return; }

        this.labels = this.filters.data('filter-labels');

        this.search.on('input', debounce(() => this.filter(), 250));
        this.filters.on('change', () => this.filter());

        // restore state
        if (storage.flags || storage.query) {
            this.setValues(storage);
            this.filter();
        }

        this._initSelectize();
    }

    filter(value) {
        let data = { flags: '', query: '' };

        if (typeof value === 'object') {
            Object.assign(data, value);
        }
        if (typeof value === 'string') {
            data.query = value;
        }
        if (typeof value === 'undefined') {
            data.flags = this.filters.val();
            data.query = this.search.val();
        }

        if (!Object.keys(data).filter((key) => data[key] !== '').length) {
            this.resetValues();
            return;
        }

        data.flags = data.flags.replace(/(\s{1,})?,(\s{1,})?/g, ',');
        this.setValues({ flags: data.flags, query: data.query }, 'silent');

        request(`${config.base_url_relative}/pages-filter.json/task${config.param_sep}filterPages`, {
            method: 'post',
            body: data
        }, (response) => {
            this.refreshDOM(response);
        });
    }

    refreshDOM(response) {
        let items = $('[data-nav-id]');

        if (!response) {
            items.removeClass('search-match').show();
            this.tree.restore();

            return;
        }

        items.removeClass('search-match').hide();

        response.results.forEach((page) => {
            let match = items.filter(`[data-nav-id="${page}"]`).addClass('search-match').show();
            match.parents('[data-nav-id]').addClass('search-match').show();

            this.tree.expand(page, 'no-store');
        });
    }

    setValues({ flags = '', query = ''}, silent) {
        let flagsArray = flags.replace(/(\s{1,})?,(\s{1,})?/g, ',').split(',');
        if (this.filters.val() !== flags) {
            let selectize = this.filters.data('selectize');
            this.filters[selectize ? 'setValue' : 'val'](flagsArray, silent);
        }
        if (this.search.val() !== query) { this.search.val(query); }

        localStorage.setItem('grav:admin:pages:filter', JSON.stringify({ flags, query }));
    }

    resetValues() {
        this.setValues('', 'silent');
        this.refreshDOM();
    }

    _initSelectize() {
        let extras = {
            type: this.filters.data('filter-types') || {},
            access: this.filters.data('filter-access-levels') || {}
        };

        Object.keys(extras).forEach((cat) => {
            Object.keys(extras[cat]).forEach((key) => {
                this.options.push({
                    cat,
                    key,
                    flag: extras[cat][key]
                });
            });
        });

        this.filters.selectize({
            maxItems: null,
            valueField: 'key',
            labelField: 'flag',
            searchField: ['flag', 'key'],
            options: this.options,
            optgroups: this.labels,
            optgroupField: 'cat',
            optgroupLabelField: 'name',
            optgroupValueField: 'id',
            optgroupOrder: this.labels.map((item) => item.id),
            plugins: ['optgroup_columns']
        });
    }
}

let Instance = new PagesFilter('input[name="page-filter"]', 'input[name="page-search"]');
export { Instance };
