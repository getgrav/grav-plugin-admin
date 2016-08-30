import $ from 'jquery';
import { config } from 'grav-config';
import request from '../../utils/request';

export default class FilePickerField {

    constructor(options) {
		this.options = Object.assign({}, options);
        $('[data-grav-filepicker]').each((index, element) => this.add(element));
    }

    add(element) {
        element = $(element);
        let tag = element.prop('tagName').toLowerCase();
        let isInput = tag === 'input' || tag === 'select';

        let data = (isInput ? element.closest('[data-grav-selectize]') : element).data('grav-selectize') || {};
        let field = (isInput ? element : element.find('input, select'));

        if (!field.length || field.get(0).selectize) { return; }

        var getData = function getData(field, callback) {
            let url = config.current_url + `.json/task${config.param_sep}getFilesInFolder`;
            let name = field.first().parents('[data-grav-filepicker]').data('name');

            request(url, {
                method: 'post',
                body: {
                    name: name
                }
            }, (response) => {
                if (typeof response.files == 'undefined') {
                    return;
                }
                var data = [];
                for(var i = 0; i < response.files.length; i++) {
                    data.push({'name': response.files[i]});
                }
                callback(data);
            });
        };

        field.selectize({
            valueField: 'name',
            labelField: 'name',
            searchField: 'name',
            create: false,
            preload: true,
            render: {
                option: function(item, escape) {
                    return '<div>' +
                        '<span class="title">' +
                        '<span class="name">' + escape(item.name) + '</span>' +
                        '</span>' +
                        '</div>';
                }
            },
            load: function(query, callback) {
                getData(field, function(data) {
                    console.log(data);
                    callback(data);
                });
            },
            onFocus: function() {
                var that = this;
                this.clearOptions();

                getData(field, function(data) {
                    data.forEach(function(item) {
                        that.addOption(item);
                        that.refreshOptions();
                    });
                });
            }
        });
    }
}

export let Instance = new FilePickerField();
