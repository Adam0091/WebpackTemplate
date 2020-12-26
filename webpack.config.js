const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TenserWebpackPlugin = require('terser-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack')

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const optimization = () =>{
    const configObj = {
        splitChunks:{
            chunks: 'all'
        }
    }

    if(isProd){
        configObj.minimizer = [
            new OptimizeCssWebpackPlugin(),
            new TenserWebpackPlugin()
        ];
    }

    return configObj;
};

const plugins = () =>{
    const basePlugins = [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, './source/index.pug'),
            filename: 'index.html',
            inject: true,
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: `./css/${filename('css')}`,
        }),
        new CopyWebpackPlugin({
            patterns:[
                {
                    from: path.resolve(__dirname, './source/assets'),
                    to:  path.resolve(__dirname, 'app')
                }
            ]
        })
    ];

    if (isProd){
        basePlugins.push(
            new ImageminPlugin({
                bail: false, // Ignore errors on corrupted images
                cache: true,
                imageminOptions: {
                  // Before using imagemin plugins make sure you have added them in `package.json` (`devDependencies`) and installed them
           
                  // Lossless optimization with custom option
                  // Feel free to experiment with options for better result for you
                  plugins: [
                    ["gifsicle", { interlaced: true }],
                    ["jpegtran", { progressive: true }],
                    ["optipng", { optimizationLevel: 5 }],
                    [
                      "svgo",
                      {
                        plugins: [
                          {
                            removeViewBox: false
                          }
                        ]
                      }
                    ]
                  ]
                }
            })
        )
    }
    return basePlugins;
}

module.exports = {
    context: path.resolve(__dirname, ""),
    mode: 'development',
    entry: './source/js/main.js', 
    output: {
        filename: `./js/${filename('js')}`,
        path: path.resolve(__dirname, 'app'),
        publicPath: ''
    },
    devServer:{
        historyApiFallback: true,
        contentBase: path.join(__dirname, 'app'),
        open: true,
        hot: true,
        compress: true,
        port: 3000
    },
    optimization: optimization(),
    plugins: plugins(),
    devtool: isProd ? false : 'source-map',
    module: {
        rules: 
        [
            {
                test: /\.pug$/,
                loader: 'pug-loader',
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader, 
                        options:{
                            publicPath: (resourcePath, context) =>{
                                return path.relative(path.dirname(resourcePath), context) + '/';
                            }
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(?:|gif|png|jpg|jpeg|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options:{
                        name: `./img/${filename('[ext]')}`,
                    }
                }]
            },
            {
                test: /\.(?:|woff2)$/,
                use: [{
                    loader: 'file-loader',
                    options:{
                        name: `./fonts/${filename('[ext]')}`,
                    }
                }]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            //{test: /\.css$/,use: [MiniCssExtractPlugin.loader, 'css-loader'],},
        ]
    }
}; 