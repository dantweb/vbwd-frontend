<template>
  <div class="profile">
    <h1>Profile</h1>

    <div v-if="loading" class="loading">Loading profile...</div>

    <div v-else-if="error" class="error" data-testid="profile-error">
      {{ error }}
    </div>

    <div v-else-if="store.profile" class="profile-content">
      <div class="card">
        <h2>Personal Information</h2>
        <form @submit.prevent="handleUpdateProfile">
          <div class="form-group">
            <label>Name</label>
            <span data-testid="profile-name">{{ store.profile.name }}</span>
            <input
              v-model="editName"
              type="text"
              data-testid="name-input"
            />
          </div>
          <div class="form-group">
            <label>Email</label>
            <span data-testid="profile-email">{{ store.profile.email }}</span>
          </div>
          <button type="submit" data-testid="save-profile">Save Changes</button>
        </form>
      </div>

      <div class="card">
        <h2>Change Password</h2>
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label>Current Password</label>
            <input
              v-model="currentPassword"
              type="password"
              data-testid="current-password"
              required
            />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input
              v-model="newPassword"
              type="password"
              data-testid="new-password"
              required
            />
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              data-testid="confirm-password"
              required
            />
          </div>
          <button type="submit" data-testid="change-password">Change Password</button>
        </form>
      </div>
    </div>

    <div v-if="successMessage" class="toast" data-testid="success-toast">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from '../stores/profile';

const store = useProfileStore();

const editName = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const successMessage = ref('');

const loading = computed(() => store.loading);
const error = computed(() => store.error);

onMounted(async () => {
  await store.fetchProfile();
  if (store.profile) {
    editName.value = store.profile.name;
  }
});

async function handleUpdateProfile() {
  try {
    await store.updateProfile({ name: editName.value });
    showSuccess('Profile updated successfully');
  } catch {
    // Error handled by store
  }
}

async function handleChangePassword() {
  if (newPassword.value !== confirmPassword.value) {
    store.error = 'Passwords do not match';
    return;
  }

  try {
    await store.changePassword(currentPassword.value, newPassword.value);
    showSuccess('Password changed successfully');
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch {
    // Error handled by store
  }
}

function showSuccess(message: string) {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
}
</script>

<style scoped>
.profile {
  max-width: 800px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.card h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 0.9rem;
}

.form-group span {
  display: block;
  padding: 8px 0;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #2980b9;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  background-color: #fee;
  color: #c00;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #27ae60;
  color: white;
  padding: 15px 25px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
