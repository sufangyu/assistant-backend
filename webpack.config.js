/* eslint-disable @typescript-eslint/no-var-requires */
// https://cloud.tencent.com/developer/article/1976319
const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const tsConfigFile = 'tsconfig.build.json'

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: 'production',
  target: "node",
  entry: "./src/main",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: "ts-loader",
          options: { transpileOnly: true }
        },
        exclude: /node_modules/
      }
    ]
  },
  externals: {},
  resolve: {
    extensions: [".js", ".ts", ".json"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigFile,
      }),
    ],
  },
  plugins: [
    // 需要进行忽略的插件
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          "@nestjs/microservices",
          "@nestjs/microservices/microservices-module",
          "@nestjs/websockets/socket-module",
          "cache-manager",
          "class-transformer",
          "class-transformer/storage",
          "class-validator",
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource, {
            paths: [process.cwd()]
          });
        } catch (err) {
          return true;
        }
        return false;
      }
    }),
    new ForkTsCheckerWebpackPlugin()
  ]
};
