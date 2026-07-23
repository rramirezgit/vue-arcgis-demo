import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@arcgis/core/assets/esri/themes/dark/main.css'
import '@arcgis/map-components/main.css'
import '@/style.css'
import App from '@/App.vue'

createApp(App).use(createPinia()).mount('#app')
