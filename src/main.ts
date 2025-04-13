import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 使用 provide 設定全域變數 $prefix
//app.provide('$prefix', 'http://localhost:8080/'); // DEV
app.provide('$prefix', './'); // PROD


app.use(router)
app.use(ElementPlus)
app.mount('#app')




