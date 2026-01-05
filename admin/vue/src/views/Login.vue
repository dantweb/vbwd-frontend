<template>
  <div class="login-container">
    <div class="login-box">
      <h1>VBWD Admin</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="input"
          >
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="input"
          >
        </div>
        <p
          v-if="error"
          class="error"
        >
          {{ error }}
        </p>
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin(): Promise<void> {
  error.value = '';
  loading.value = true;

  try {
    await authStore.login({ email: username.value, password: password.value });

    // Check if user has admin role
    if (!authStore.isAdmin) {
      authStore.logout();
      router.push('/admin/forbidden');
      return;
    }

    router.push('/admin/dashboard');
  } catch (e) {
    error.value = 'Invalid credentials';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
}

.error {
  color: #dc3545;
  margin-bottom: 15px;
  text-align: center;
}
</style>
