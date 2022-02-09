import Vue from 'vue'
import App from './App.vue'
import {SvgSprite, SvgIcon, SvgSpriteColor} from '@abi-software/svg-sprite'
import router from './router'

Vue.component('svg-icon', SvgIcon)
Vue.component('svg-sprite', SvgSprite)
Vue.component('svg-sprite-color', SvgSpriteColor)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
