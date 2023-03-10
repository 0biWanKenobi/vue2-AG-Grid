import Vue from 'vue'
import App from './App.vue'
import vuetify from './vuetify'
import store from './store'

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app')
