'use strict';

var gulp        = require('gulp'),
    path        = require('path'),
    immutable   = require('immutable'),
    merge       = require('merge-stream'),
    gulpWebpack = require('gulp-webpack'),
    webpack     = require('webpack');

var plugins = {
        'Promise': 'imports?this=>global!exports?global.Promise!babel-polyfill',
        'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    },
    base    = immutable.fromJS(require('./webpack.conf.js')),
    options = {
        dev: base.mergeDeep({
            devtool: 'source-map',
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': { NODE_ENV: '"development"' }
                }),
                new webpack.ProvidePlugin(plugins),
                new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js", Infinity)
            ],
            output: {
                filename: 'admin.js'
            }
        }),

        prod: base.mergeDeep({
            plugins: [
                new webpack.DefinePlugin({
                    'process.env': { NODE_ENV: '"production"' }
                }),
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: false,
                    compress: {
                        warnings: false
                    }
                }),
                new webpack.ProvidePlugin(plugins),
                new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.min.js", Infinity)
            ],
            output: {
                filename: 'admin.min.js'
            }
        })
    };

var compileJS = function(watch) {
    var devOpts  = options.dev.set('watch', watch),
        prodOpts = options.prod.set('watch', watch);

    var prod = gulp.src('app/main.js')
        .pipe(gulpWebpack(prodOpts.toJS()))
        .pipe(gulp.dest('js/'));

    var dev = gulp.src('app/main.js')
        .pipe(gulpWebpack(devOpts.toJS()))
        .pipe(gulp.dest('js/'));

    return merge(prod, dev);
};

gulp.task('js', function() {
    compileJS(false);
});

gulp.task('watch', function() {
    compileJS(true);
});

gulp.task('default', ['js']);
