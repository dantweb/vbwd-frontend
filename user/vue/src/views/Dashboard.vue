<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div class="dashboard-grid">
      <div class="card">
        <h3>Welcome</h3>
        <p>Welcome to your VBWD dashboard.</p>
      </div>
      <div class="card">
        <h3>Quick Actions</h3>
        <div class="actions">
          <router-link to="/profile" class="action-btn">View Profile</router-link>
          <router-link to="/subscription" class="action-btn">Subscription</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dashboard component - placeholder for Sprint 06 implementation
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.card h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.card p {
  color: #666;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  display: block;
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #2980b9;
}
</style>
