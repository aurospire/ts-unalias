import nodepath from 'path';

import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import NodemonPlugin from 'nodemon-webpack-plugin';

import { unaliasTransformerFactory, extractWebpackAliases, extractTsConfigPaths, getTsCompilerOptions, extractPathAliases, webpackAliases } from 'ts-unalias';

const config: Configuration = {
    entry: './src/index.ts',
    mode: process.env.NODE_ENV === 'production' ? 'production' : process.env.NODE_ENV === 'development' ? 'development' : 'none',
    devtool: 'inline-source-map',
    target: 'node',
    externals: [nodeExternals()],
    output: {
        filename: 'index.js',
        path: nodepath.resolve(__dirname, '..', '..', 'dist'),
        library: {
            name: 'tester',
            type: 'this'
        },
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules'],
        mainFiles: ['index'],
        // alias: {
        //     '@utils': nodepath.resolve(__dirname, '..', '..', 'src/utils'),
        //     '@components': nodepath.resolve(__dirname, '..', '..', 'src/components'),
        //     '@models': nodepath.resolve(__dirname, '..', '..', 'src/models'),
        // }
        alias: webpackAliases(nodepath.resolve(__dirname, '..', '..'), {
            // onTsPath: (item => console.log(item)),
            // onPathAlias: (item => console.log(item)),
            // onWebpackAlias: (item => console.log(item))
        })
    },
    module: {
        rules: [
            {
                test: /.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        getCustomTransformers: (program: any) => ({
                            afterDeclarations: [unaliasTransformerFactory(program, {
                                onPathAlias: (item) => console.log(item),
                                //onResolve: (item) => console.log(item)
                            })]
                        }),
                    },
                }]
            }
        ]
    },
    plugins: [
        new NodemonPlugin(),
    ],
};

export default config;
