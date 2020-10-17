module.exports = {
    chainWebpack: config => {
        config.module
            .rule('mdfile')
            .test(/\.md$/)
            .use('file-loader')
            .loader('file-loader')
            .end()
    },
    publicPath: '/TIL_Vue'
}