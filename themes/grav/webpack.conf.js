var path    = require('path'),
    webpack = require('webpack');

module.exports = {
    entry: {
        app: './app/main.js',
        vendor: [
            'codemirror',
            'chartist',
            'selectize',
            /* 'rangetouch',*/
            'toastr',
            'bootstrap',
            'sortablejs',
            'dropzone',
            'watchjs',
            'js-yaml',
            'speakingurl',
            'moment',
            'moment-timezone',
            'whatwg-fetch'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'js'),
        library: 'Grav'
    },
    externals: {
        jquery: 'jQuery',
        'grav-config': 'GravAdmin'
    },
    module: {
        preLoaders: [
            { test: /\.json$/, loader: 'json' },
            { test: /\.js$/, loader: 'eslint', exclude: /node_modules/ }
        ],
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.js$/, loader: 'babel', exclude: /node_modules/, query: { presets: ['es2015', 'stage-3'] } }
        ]
    }
};
