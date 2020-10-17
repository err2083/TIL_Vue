import Vue from 'vue';
import App from './App.vue';
import router from '@/router/index.js';
import VueResource from "vue-resource";
import VueShowdown from 'vue-showdown';

Vue.config.productionTip = false
Vue.use(VueResource);
Vue.use(VueShowdown, {
  flavor: 'github',
  options: {
    emoji: false,
  },
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
