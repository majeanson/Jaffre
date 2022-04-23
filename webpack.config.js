const path = require('path');

module.exports = {
    mode: "development",
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: [/\.vert$/, /\.frag$/],
                use: "raw-loader"
            },
            {
                test: /\.(gif|png|jpe?g|svg|xml)$/i,
                use: "file-loader"
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    devtool: 'eval',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'),
        },
        allowedHosts: ['all'],
        compress: true,
        port: 9000,
    },
};