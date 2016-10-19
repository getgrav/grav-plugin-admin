import $ from 'jquery';
import { config } from 'grav-config';
import request from '../../utils/request';

export default class FilePickerField {

    constructor(options) {
        this.items = $();
        this.options = Object.assign({}, this.defaults, options);

        $('[data-grav-filepicker]').each((index, element) => this.addItem(element));
        $('body').on('mutation._grav', this._onAddedNodes.bind(this));
    }

    _onAddedNodes(event, target/* , record, instance */) {
        let fields = $(target).find('[data-grav-filepicker]');
        if (!fields.length) { return; }

        fields.each((index, field) => {
            field = $(field);
            if (!~this.items.index(field)) {
                this.addItem(field);
            }
        });
    }

    addItem(element) {
        element = $(element);
        this.items = this.items.add(element);

        let tag = element.prop('tagName').toLowerCase();
        let isInput = tag === 'input' || tag === 'select';

        let field = (isInput ? element : element.find('input, select'));

        let folder = '';

        if (!field.length || field.get(0).selectize) { return; }

        let getData = function getData(field, callback) {
            let url = config.current_url + `.json/task${config.param_sep}getFilesInFolder`;
            let parent = field.closest('[data-grav-filepicker]');
            let name = parent.data('name');
            let value = parent.data('value');

            request(url, {
                method: 'post',
                body: { name }
            }, (response) => {
                if (typeof response.files === 'undefined') {
                    return;
                }

                let data = [];
                for (let i = 0; i < response.files.length; i++) {
                    data.push({'name': response.files[i], 'status': 'available'});
                }
                for (let i = 0; i < response.pending.length; i++) {
                    data.push({'name': response.pending[i], 'status': 'pending'});
                }

                folder = response.folder;
                callback(data, value);
            });
        };

        let imagesPreview = field.closest('[data-preview-images]').length > 0;
        let selectedIsRendered = false;

        let renderOption = function renderOption(item, escape) {
            let image = '';
            if (imagesPreview && folder && item.status === 'available' && item.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                image = `
                    <img class="filepicker-field-image" 
                         src="${config.base_url_relative}/../${folder}/${item.name}"/>`;
            }

            return `<div>
                        <span class="title">
                            ${image} <span class="name filepicker-field-name">${escape(item.name)}</span>
                        </span>
                    </div>`;
        };

        field.selectize({
            valueField: 'name',
            labelField: 'name',
            searchField: 'name',
            optgroups: [
                {$order: 1, value: 'pending', label: 'Pending'},
                {$order: 2, value: 'available', label: 'Available'}
            ],
            optgroupField: 'status',
            // lockOptgroupOrder: true,
            create: false,
            preload: false, // 'focus',
            render: {
                option: function(item, escape) {
                    return renderOption(item, escape);
                },

                item: function(item, escape) {
                    return renderOption(item, escape);
                }
            },

            onLoad: function(/* data */) {
                if (!selectedIsRendered) {
                    let name = this.getValue();
                    this.updateOption(name, { name });

                    selectedIsRendered = true;
                }
            },

            onFocus: function() {
                this.load((callback) => getData(field, (data) => callback(data)));
            }
        });
    }
}

export let Instance = new FilePickerField();
