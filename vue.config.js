module.exports = {
  devServer: {
    disableHostCheck: true,
    port: 4000,
    public: '0.0.0.0:4000',
  },
  publicPath: '/',
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        options.compiler = require('vue-template-babel-compiler')
        return options
      })
  },
}
