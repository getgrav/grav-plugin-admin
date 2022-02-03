const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env, argv) => ({
    entry: {
        admin: './app/main.js'
    },
    devtool: argv.mode === 'production' ? false : 'eval-source-map',
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'js'),
        filename: '[name].min.js',
        chunkFilename: 'vendor.min,js',
        library: 'Grav'
    },
    optimization: {
        minimize: argv.mode === 'disabled-production',
        minimizer: [new TerserPlugin()],
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: 1,
                    name: 'vendor',
                    enforce: true,
                    chunks: 'all'
                }
            }
        }
    },
    externals: {
        jquery: 'jQuery',
        'grav-config': 'GravAdmin'
    },
    plugins: [new ESLintPlugin({
      extensions: ['js', 'jsx'],
      exclude: ['/node_modules/']
    })],
    module: {
        rules: [
            { enforce: 'pre', test: /\.json$/, loader: 'json-loader' },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-proposal-object-rest-spread']
                }
            }
        ]
    }
});
