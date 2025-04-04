// frontend/vue.config.js
const path = require('path');
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        pathRewrite: {'^/api': '/api'},
        logLevel: 'debug',
        ws: true
      }
    },
    port: 8080,
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  },
  transpileDependencies: ["vuetify"],
});

process.env.__VUE_OPTIONS_API__ = true;
process.env.__VUE_PROD_DEVTOOLS__ = false;
process.env.VUE_APP_FEATURE_FLAGS = {
 __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
};