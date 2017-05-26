import $ from 'jquery';
import { config, uri_params } from 'grav-config';
import request from '../utils/request';

export default class Filter {
    constructor() {
        this.URI = `${config.base_url_relative}/media-manager/`;
    }

    filter(name, value) {
        let filtered = [];
        let keys = Object.keys(uri_params);
        if (!~keys.indexOf(name)) { keys.push(name); }

        keys.forEach((key) => {
            let filter = Filter.cleanValue(key === name ? value : uri_params[key]);
            if (filter !== '*') {
                filtered.push(`${key}${config.param_sep}${filter}`);
            }
        });

        global.location = this.URI + filtered.join('/');
    }

    static cleanValue(value) {
        return encodeURIComponent(value.replace('/', '\\'));
    }
}

export let Instance = new Filter();
var isLoading = false;

var filters = {};
var global_index = 0;

/* handle changing file type / date filter */
$('body').on('change', '.thumbs-list-container select.filter', (event) => {
    let target = $(event.currentTarget);
    let filterName = target.data('name');
    let filterValue = target.val();

    if (filterValue) {
        filters[filterName] = filterValue;
    } else {
        delete filters[filterName];
    }

    filterFiles();
});

/* initialize media uploader */
if ($('.thumbs-list-container .dropzone')[0]) {
    $('.thumbs-list-container .dropzone')[0].dropzone.on('queuecomplete', function() {
        let body = {};
        if (filters.page) { body.page = filters.page; }
        if (filters.date) { body.date = filters.date; }
        if (filters.type) { body.type = filters.type; }

        $('.dropzone')[0].dropzone.files.forEach(function(file) { file.previewElement.remove(); });
        $('.dropzone').first().removeClass('dz-started');

        request(config.base_url_relative + '/media-manager.json/task:clearMediaCache', { method: 'post', body }, () => {
            filterFiles();
        });
    });
}

/* handle loading media */
var loadMedia = function loadMedia(filters, callback) {
    var url = config.base_url_relative + '/media-manager.json/tmpl:media-list-content/index:' + global_index;

    if (filters.page) {
        url += '/page:' + (filters.page).split('/').join('%5C');
    }
    if (filters.type && filters.type !== '*') {
        url += '/type:' + filters.type;
    }
    if (filters.date && filters.date !== '*') {
        url += '/date:' + filters.date;
    }

    if (!isLoading) {
        isLoading = true;

        $('.spinning-wheel').show();
        $.get(url, function(content) {
            $('.js__files').append(content);
            $('.spinning-wheel').hide();
            isLoading = false;
            global_index++;

            callback(content);
        });
    }
};

var cleanFilesList = function cleanFilesList() {
    $('.js__files .card-item').remove();
};

var resetActiveStateInSidebar = function resetActiveStateInSidebar() {
    $('.pages-list-container .row').removeClass('active'); // clear active state in sidebar
};

var showEmptyState = function showEmptyState() {
    $('.js__files').append('<p class="card-item empty-space">No media found</p>');
};

var filterFiles = function filterFiles() {
    cleanFilesList();
    global_index = 0;
    loadMedia(filters, function(content) {
        if (!$(content).length) {
            showEmptyState();
        }
    });
};

/* handle changing page */
$('body').on('click', '.pages-list-container .js__page-link', (event) => {
    var page = $(event.target).data('page');
    filters['page'] = page;

    $('.media-list-title .page-indicator').html(page); // set indication
    $('.js__reset-pages-filter').removeClass('hidden'); // activate reset pages icon
    resetActiveStateInSidebar();
    $(event.target).parents('.row').addClass('active'); // set active state in sidebar
    $('.js__file-uploader').removeClass('hidden');

    // customize processing URL, as the page changes dynamically
    if ($('.dropzone')[0]) {
        $('.dropzone')[0].dropzone.on('processing', function(file) {
            this.options.url = `${config.base_url_relative}/media-manager${page}.json/task${config.param_sep}addmedia`;
        });
    }

    $('.js__button-clear-media-cache').addClass('hidden');
    filterFiles();

    disableInfiniteScrolling(); // only infinite scroll on main list, not inside single pages
});

/* handle clearing page filter */
$('body').on('click', '.js__reset-pages-filter', (event) => {
    $('.media-list-title .page-indicator').html('All Pages'); // set indication
    cleanFilesList();
    resetActiveStateInSidebar();
    $('.js__reset-pages-filter').addClass('hidden'); // remove reset pages icon
    $('.js__file-uploader').addClass('hidden');
    $('.js__button-clear-media-cache').removeClass('hidden');
    delete filters['page'];

    filterFiles();

    enableInfiniteScrolling();
});

/* handle infinite loading */
var enableInfiniteScrolling = function enableInfiniteScrolling() {
    $('.spinning-wheel').hide();
    var files_ended = false;
    var view = $('.content-wrapper');
    view.scroll(function() {
        if (files_ended) {
            return;
        }

        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            loadMedia({}, function(content) {
                if (!$(content).length) {
                    files_ended = true;
                }
            });
        }
    });
};

/* disable infinite loading */
var disableInfiniteScrolling = function disableInfiniteScrolling() {
    $('.spinning-wheel').hide();
    $('.content-wrapper').unbind('scroll');
};
