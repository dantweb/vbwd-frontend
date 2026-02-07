import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initializeApi } from '@/api';
import i18n, { initLocale } from '@/i18n';

// Initialize API with stored auth token before mounting app
initializeApi();

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

// Initialize locale from stored preference
initLocale();

app.mount('#app');
