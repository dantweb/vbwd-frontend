<template>
  <div
    class="card-display"
    :class="[`position-${card.position.toLowerCase()}`, `orientation-${card.orientation.toLowerCase()}`]"
    :title="cardTitle"
    data-testid="card-display"
    @click="$emit('card-click', card.card_id)"
  >
    <!-- Card Visual -->
    <div
      class="card-visual"
      :class="{ reversed: card.orientation === 'REVERSED' }"
    >
      <div class="card-placeholder">
        <svg
          width="80"
          height="120"
          viewBox="0 0 80 120"
          fill="none"
          stroke="currentColor"
        >
          <rect
            x="2"
            y="2"
            width="76"
            height="116"
            rx="4"
            stroke-width="1.5"
          />
          <path
            d="M 40 30 L 50 50 L 30 50 Z"
            stroke-width="1.5"
          />
          <circle
            cx="40"
            cy="75"
            r="15"
            stroke-width="1.5"
          />
        </svg>
        <div class="position-label">
          {{ card.position }}
        </div>
      </div>
    </div>

    <!-- Card Info -->
    <div class="card-info">
      <div class="card-position">
        {{ $t(`taro.position.${card.position.toLowerCase()}`) }}
      </div>
      <div
        class="card-orientation"
        :class="{ reversed: card.orientation === 'REVERSED' }"
      >
        {{ $t(`taro.orientation.${card.orientation.toLowerCase()}`) }}
      </div>

      <!-- Interpretation (if available) -->
      <div
        v-if="card.interpretation"
        class="card-interpretation"
      >
        {{ card.interpretation }}
      </div>

      <!-- Loading Interpretation -->
      <div
        v-else
        class="interpretation-loading"
      >
        <span class="text-secondary">{{ $t('taro.loadingInterpretation') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaroCard } from '@/stores';
import { computed } from 'vue';

interface Props {
  card: TaroCard;
}

const props = defineProps<Props>();
defineEmits<{
  'card-click': [cardId: string];
}>();

const cardTitle = computed(() => {
  const position = `taro.position.${props.card.position.toLowerCase()}`;
  const orientation = `taro.orientation.${props.card.orientation.toLowerCase()}`;
  return `${position} - ${orientation}`;
});
</script>

<style scoped>
.card-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  background: var(--color-background);
}

.card-display:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.1);
  transform: translateY(-4px);
}

.card-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  background: linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.card-visual.reversed {
  transform: rotate(180deg);
}

.card-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
}

.card-placeholder svg {
  color: var(--color-primary);
  opacity: 0.7;
}

.position-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-primary);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.card-position {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  text-transform: capitalize;
}

.card-orientation {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.card-orientation.reversed {
  color: var(--color-warning);
  font-weight: 500;
}

.card-interpretation {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: var(--spacing-xs);
}

.interpretation-loading {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.text-secondary {
  opacity: 0.7;
}

/* Position-specific styling */
.position-past .card-placeholder svg {
  opacity: 0.5;
}

.position-present .card-placeholder svg {
  opacity: 0.9;
}

.position-future .card-placeholder svg {
  opacity: 0.7;
  color: var(--color-success);
}

/* Responsive */
@media (max-width: 640px) {
  .card-display {
    padding: var(--spacing-xs);
  }

  .card-visual {
    height: 120px;
  }

  .card-placeholder svg {
    width: 60px;
    height: 90px;
  }
}
</style>
