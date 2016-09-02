import $ from 'jquery';
import { config } from 'grav-config';
import request from '../../utils/request';

export default class FilePickerField {

    constructor(options) {
        $('[data-grav-filepicker]').each((index, element) => this.add(element));
    }

    add(element) {
        element = $(element);
        let tag = element.prop('tagName').toLowerCase();
        let isInput = tag === 'input' || tag === 'select';

        let data = (isInput ? element.closest('[data-grav-selectize]') : element).data('grav-selectize') || {};
        let field = (isInput ? element : element.find('input, select'));

        var folder = '';

        if (!field.length || field.get(0).selectize) { return; }

        var getData = function getData(field, callback) {
            let url = config.current_url + `.json/task${config.param_sep}getFilesInFolder`;
            let parent = field.first().parents('[data-grav-filepicker]');
            let name = parent.data('name');
            let value= parent.data('value');

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

                folder = response.folder;

                callback(data, value);
            });
        };

        var refreshingCurrentValue = false;

        field.selectize({
            valueField: 'name',
            labelField: 'name',
            searchField: 'name',
            create: false,
            preload: true,
            render: {
                option: function(item, escape) {
                    let image = '';
                    if (item.name.match(/\.(jpg|jpeg|png|gif)$/)) {
                        image = '<img class="filepicker-field-image" src="' + config.base_url_relative + '/../' + folder + '/' + item.name +'"/>';
                    }

                    return '<div>' +
                        '<span class="title">' +
                        image +
                        '<span class="name">' + escape(item.name) + '</span>' +
                        '</span>' +
                        '</div>';
                }
            },
            load: function(query, callback) {
                var that = this;

                getData(field, function(data, value) {
                    callback(data);
                    that.setValue(value);
                });
            },
            onFocus: function() {
                if (refreshingCurrentValue) {
                    return;
                }
                var that = this;
                var currentValue = that.getValue();
                this.clearOptions();

                getData(field, function(data, value) {
                    data.forEach(function(item) {
                        that.addOption(item);
                        that.refreshOptions();
                    });

                    refreshingCurrentValue = true;
                    that.setValue(currentValue);
                    setTimeout(function() {
                        refreshingCurrentValue = false;
                    }, 1000);
                });
            }
        });
    }
}

export let Instance = new FilePickerField();
