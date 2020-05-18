import Vue from 'vue'
import App from './App'
import router from './router/index'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI)
Vue.prototype.$global = {
  link:false,
}
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

