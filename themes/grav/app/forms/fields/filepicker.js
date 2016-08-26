import $ from 'jquery';
import { config } from 'grav-config';
import request from '../../utils/request';

export default class FilePickerField {

    constructor(options) {
		var getData = function getData(callback) {
		    request(`${config.base_url_relative}/ajax.json/task${config.param_sep}getFilesInFolder`, {
		        method: 'post',
		        body: {
		            folder: '/pages/10.blog'
		        }
		    }, (response) => {
		        var data = [];
		        for(var i = 0; i < response.files.length; i++) {
		          data.push({'name': response.files[i]});
		        }
		        callback(data);
		    });
		};

		$('#select-repo').selectize({
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
		        getData(function(data) {
		            console.log(data);
		            callback(data);
		        });
		    },
		    onFocus: function() {
		        var that = this;
		        this.clearOptions();

		        getData(function(data) {
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
