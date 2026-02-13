<template>
  <div class="user-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>VBWD</h2>
      </div>
      <nav class="nav-menu">
        <router-link
          to="/dashboard"
          class="nav-item"
        >
          {{ $t('nav.dashboard') }}
        </router-link>
        <router-link
          to="/dashboard/profile"
          class="nav-item"
        >
          {{ $t('nav.profile') }}
        </router-link>
        <router-link
          to="/dashboard/subscription"
          class="nav-item"
        >
          {{ $t('nav.subscription') }}
        </router-link>
        <router-link
          to="/dashboard/invoices"
          class="nav-item"
        >
          {{ $t('nav.invoices') }}
        </router-link>
        <router-link
          to="/dashboard/plans"
          class="nav-item"
        >
          {{ $t('nav.plans') }}
        </router-link>
        <router-link
          to="/dashboard/tokens"
          class="nav-item"
        >
          {{ $t('nav.tokens') }}
        </router-link>
        <router-link
          to="/dashboard/add-ons"
          class="nav-item"
        >
          {{ $t('nav.addons') }}
        </router-link>
        <router-link
          v-if="enabledPlugins.has('theme-switcher')"
          to="/dashboard/appearance"
          class="nav-item"
          data-testid="nav-appearance"
        >
          {{ $t('nav.appearance') }}
        </router-link>
        <router-link
          v-if="enabledPlugins.has('chat')"
          to="/dashboard/chat"
          class="nav-item"
          data-testid="nav-chat"
        >
          {{ $t('nav.chat') }}
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <!-- Cart Icon -->
        <div class="cart-wrapper">
          <button
            class="cart-btn"
            data-testid="cart-icon"
            @click="toggleCart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle
                cx="9"
                cy="21"
                r="1"
              />
              <circle
                cx="20"
                cy="21"
                r="1"
              />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span
              v-if="cartItemCount > 0"
              class="cart-badge"
              data-testid="cart-count"
            >
              {{ cartItemCount }}
            </span>
          </button>
          <!-- Cart Dropdown -->
          <div
            v-if="showCart"
            class="cart-dropdown"
            data-testid="cart-dropdown"
          >
            <div class="cart-header">
              <h4>{{ $t('layout.shoppingCart') }}</h4>
              <span class="cart-count-text">{{ cartItemCount }} {{ cartItemCount === 1 ? $t('common.item') : $t('common.items') }}</span>
            </div>
            <div class="cart-content">
              <div
                v-if="cartStore.isEmpty"
                class="cart-empty"
              >
                <p data-testid="cart-empty-message">
                  {{ $t('layout.cartEmpty') }}
                </p>
              </div>
              <div
                v-else
                class="cart-items"
              >
                <div
                  v-for="item in cartStore.items"
                  :key="`${item.type}-${item.id}`"
                  class="cart-item"
                  :data-testid="`cart-item-${item.id}`"
                >
                  <div class="cart-item-info">
                    <span class="cart-item-name">{{ item.name }}</span>
                    <span class="cart-item-qty">x{{ item.quantity }}</span>
                  </div>
                  <div class="cart-item-actions">
                    <span class="cart-item-price">{{ formatPrice(item.price * item.quantity) }}</span>
                    <button
                      class="remove-btn"
                      :data-testid="`remove-cart-item-${item.id}`"
                      @click="cartStore.removeItem(item.id)"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="!cartStore.isEmpty"
              class="cart-footer"
            >
              <div class="cart-total">
                <span>{{ $t('layout.cartTotal') }}</span>
                <span
                  class="total-value"
                  data-testid="cart-total"
                >{{ formatPrice(cartStore.total) }}</span>
              </div>
              <button
                class="checkout-btn"
                data-testid="cart-checkout-btn"
                @click="goToCheckout"
              >
                {{ $t('common.checkout') }}
              </button>
            </div>
          </div>
        </div>
        <!-- User Menu -->
        <div
          class="user-menu"
          data-testid="user-menu"
          @click="toggleUserMenu"
        >
          <span>{{ userEmail }}</span>
          <div
            v-if="showUserMenu"
            class="user-dropdown"
          >
            <button
              data-testid="logout-button"
              @click="logout"
            >
              {{ $t('common.logout') }}
            </button>
          </div>
        </div>
      </div>
    </aside>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@vbwd/view-component';
import { storeToRefs } from 'pinia';

const enabledPlugins = inject<Set<string>>('enabledPlugins', new Set());

const router = useRouter();

// Use cart store directly — pinia deduplication in vite.config.js ensures single instance
const cartStoreRaw = useCartStore();
const { items: cartItems, itemCount: cartItemCount, total: cartTotal, isEmpty: cartIsEmpty } = storeToRefs(cartStoreRaw);

// Proxy object for template convenience (actions + reactive state)
const cartStore = {
  get items() { return cartItems.value; },
  get total() { return cartTotal.value; },
  get isEmpty() { return cartIsEmpty.value; },
  removeItem: (id: string) => cartStoreRaw.removeItem(id),
};

const showUserMenu = ref(false);
const showCart = ref(false);

const userEmail = computed(() => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user).email || 'User';
    } catch {
      return 'User';
    }
  }
  return 'User';
});

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
  showCart.value = false;
}

function toggleCart() {
  showCart.value = !showCart.value;
  showUserMenu.value = false;
}

function goToCheckout() {
  showCart.value = false;
  // Navigate to checkout with cart items
  const planItems = cartItems.value.filter(i => i.type === 'plan');
  if (planItems.length > 0) {
    router.push({ name: 'checkout', params: { planSlug: planItems[0].id } });
  } else {
    // Just tokens/add-ons, go to a generic checkout
    router.push('/dashboard/checkout/cart');
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  router.push('/login');
}

// Close dropdowns on click outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.cart-wrapper')) {
    showCart.value = false;
  }
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: var(--vbwd-sidebar-bg, #2c3e50);
  color: var(--vbwd-sidebar-text, rgba(255, 255, 255, 0.8));
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.logo {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: block;
  padding: 12px 20px;
  color: var(--vbwd-sidebar-text, rgba(255, 255, 255, 0.8));
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: var(--vbwd-sidebar-active-bg, rgba(255, 255, 255, 0.1));
  color: white;
}

.user-menu {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  position: relative;
}

.user-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #34495e;
  padding: 10px;
}

.user-dropdown button {
  width: 100%;
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.user-dropdown button:hover {
  background-color: #c0392b;
}

.sidebar-footer {
  margin-top: auto;
}

.cart-wrapper {
  position: relative;
  padding: 10px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.cart-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.cart-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.cart-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.15);
  margin-bottom: 5px;
  z-index: 100;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.cart-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 0.875rem;
}

.cart-count-text {
  font-size: 0.75rem;
  color: #666;
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  max-height: 200px;
}

.cart-empty {
  padding: 30px 15px;
  text-align: center;
  color: #999;
}

.cart-items {
  padding: 10px 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-item-name {
  font-size: 0.875rem;
  color: #2c3e50;
}

.cart-item-qty {
  font-size: 0.75rem;
  color: #999;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-item-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
}

.remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.remove-btn:hover {
  color: #c0392b;
}

.cart-footer {
  padding: 12px 15px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.875rem;
  color: #2c3e50;
}

.total-value {
  font-weight: 700;
  font-size: 1rem;
}

.checkout-btn {
  width: 100%;
  padding: 10px;
  background: var(--vbwd-color-primary, #3498db);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkout-btn:hover {
  background: var(--vbwd-color-primary-hover, #2980b9);
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
  background-color: var(--vbwd-page-bg, #f5f5f5);
  min-height: 100vh;
}
</style>
