import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initializeApi } from '@/api';

// Initialize API with stored auth token before mounting app
initializeApi();

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
