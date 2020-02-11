module.exports = {
    chainWebpack: config => {
      // GraphQL Loader
      config.module
        .rule('plotly')
        .test(/\.(js)$/i)
        .use('transform-loader?plotly.js/tasks/compress_attributes.js')
          .loader('transform-loader?plotly.js/tasks/compress_attributes.js')
          .end()
        
    }
}