<template>
  <div class="plans">
    <h1>Select a Plan</h1>

    <div class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        :class="['plan-card', { popular: plan.popular }]"
      >
        <div v-if="plan.popular" class="popular-badge">Most Popular</div>
        <h2>{{ plan.name }}</h2>
        <div class="price">
          <span class="amount">{{ plan.price }}</span>
          <span class="period">/month</span>
        </div>
        <ul class="features">
          <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
        </ul>
        <button
          :class="['select-btn', { current: plan.current }]"
          :disabled="plan.current"
          @click="selectPlan(plan.id)"
        >
          {{ plan.current ? 'Current Plan' : 'Select Plan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

const plans = ref<Plan[]>([
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: ['1,000 API calls/month', '100 MB storage', 'Community support'],
    current: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    features: ['50,000 API calls/month', '10 GB storage', 'Priority support', 'Advanced analytics'],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    features: ['Unlimited API calls', '100 GB storage', '24/7 support', 'Custom integrations', 'SLA guarantee']
  }
]);

function selectPlan(id: string) {
  console.log('Select plan:', id);
}
</script>

<style scoped>
.plans {
  max-width: 1200px;
}

h1 {
  margin-bottom: 40px;
  color: #2c3e50;
  text-align: center;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.plan-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  position: relative;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.plan-card.popular {
  border-color: #3498db;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #3498db;
  color: white;
  padding: 4px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.plan-card h2 {
  margin-bottom: 15px;
  color: #2c3e50;
  text-align: center;
}

.price {
  text-align: center;
  margin-bottom: 25px;
}

.amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.period {
  color: #666;
}

.features {
  list-style: none;
  margin-bottom: 25px;
}

.features li {
  padding: 8px 0;
  color: #666;
  border-bottom: 1px solid #eee;
}

.features li:last-child {
  border-bottom: none;
}

.select-btn {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.select-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.select-btn.current {
  background-color: #95a5a6;
  cursor: default;
}
</style>
