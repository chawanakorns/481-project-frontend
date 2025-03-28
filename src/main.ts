/* eslint-disable vue/multi-word-component-names */
import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { Icon } from '@iconify/vue'

const app = createApp(App)
app.component('Icon', Icon)
app.use(createPinia())
app.use(router)

app.mount('#app')
