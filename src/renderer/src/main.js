import { createApp } from 'vue'
import router from './router/index'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//本地资源
import './assets/base.css'
import App from './App.vue'

const pinia = createPinia();

const app = createApp(App);
app.use(ElementPlus);
app.use(pinia);
app.use(router);
app.mount('#app');