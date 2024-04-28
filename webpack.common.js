const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

var path = require("path");

// change these variables to fit your project
const jsPath = "./src";
const cssPath = "./src";
const outputPath = "dist";
const localDomain = "index.html";
const entryPoints = {
  'cookie-guardian': jsPath + "/cookie-guardian.js",
};

module.exports = { 
  entry: entryPoints,
  output: {
    path: path.resolve(__dirname, outputPath),
    filename: "[name].js",
    publicPath: "",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),

    new BrowserSyncPlugin(
      {
        server: { baseDir: './' },
        files: [outputPath + "/*.css", "./*.html", "./**/*.js", "./**/*.css"],
        injectCss: true,
      },
      { reload: false }
    ),
  ],
  module: {
    rules: [
      // {
      //   test: /\.tsx?$/,
      //   use: 'ts-loader',
      //   exclude: /node_modules/,
      // },
      {
        test: /\.s?[c]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.sass$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sassOptions: { indentedSyntax: true },
            },
          },
        ],
      },
      {
        test: /\.(gif)$/i,
        use: "url-loader?limit=1024",
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      // `...`,
      new CssMinimizerPlugin(),
      new TerserPlugin({ parallel: true }),
    ],
  },
  // resolve: {
  //   extensions: ['.tsx', '.ts', '.js'],
  // },
};