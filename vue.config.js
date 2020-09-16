const nodeExternals = require('webpack-node-externals');

module.exports = {
  chainWebpack: config => {
    // GraphQL Loader
    config.module
      .rule('plotly')
      .test(/\.(js)$/i)
      .use('transform-loader?plotly.js/tasks/compress_attributes.js')
        .loader('transform-loader?plotly.js/tasks/compress_attributes.js')
        .end()
  },
  configureWebpack: config => {
    if(process.env.NODE_ENV === 'production') {
      config.externals =  [ nodeExternals({allowlist: [/^plotly.js/]}) ];
    }
  },
}
