import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { api } from '@/api';
import {
  configureAuthStore,
  configureEventBus,
  useAuthStore
} from '@vbwd/view-component';

// Configure auth store with admin-specific settings
configureAuthStore({
  storageKey: 'admin_token',
  apiClient: api,
  loginEndpoint: '/auth/login',
  logoutEndpoint: '/auth/logout',
  refreshEndpoint: '/auth/refresh',
  profileEndpoint: '/auth/me',
});

// Configure EventBus for frontend-to-backend event delivery
configureEventBus({
  apiClient: api,
  eventsEndpoint: '/events',
  autoSendToBackend: true,
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize auth state from localStorage
const authStore = useAuthStore();
authStore.initAuth();

app.mount('#app');
