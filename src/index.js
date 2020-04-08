import Vue from 'vue'
import App from './App'
import Axios from 'axios'
Axios.defaults.adapter = require('axios/lib/adapters/http')
import router from './router/index'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI)
Vue.prototype.$axios = Axios
Vue.prototype.$global = {
  lists: null
}
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

