/**
 * EventBus - Cross-component event communication for Vue apps
 *
 * A typed event bus that enables decoupled communication between components,
 * with support for WebSocket integration and event history for debugging.
 */

type EventCallback<T = unknown> = (payload: T) => void;

interface EventBusOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Maximum events to keep in history */
  maxHistory?: number;
}

interface EventHistoryEntry {
  event: string;
  payload: unknown;
  timestamp: Date;
}

export class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private history: EventHistoryEntry[] = [];
  private options: Required<EventBusOptions>;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      maxHistory: options.maxHistory ?? 100,
    };
  }

  /**
   * Emit an event with optional payload
   * @param event - Event name
   * @param payload - Optional event data
   */
  emit<T>(event: string, payload?: T): void {
    if (this.options.debug) {
      console.log(`[EventBus] ${event}`, payload);
    }

    // Record in history
    this.history.push({ event, payload, timestamp: new Date() });
    if (this.history.length > this.options.maxHistory) {
      this.history.shift();
    }

    // Notify all listeners
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (error) {
          console.error(`[EventBus] Error in handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event
   * @param event - Event name
   * @param callback - Handler function
   * @returns Unsubscribe function
   */
  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param callback - Handler function to remove
   */
  off<T>(event: string, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  /**
   * Subscribe to an event once (auto-unsubscribes after first emit)
   * @param event - Event name
   * @param callback - Handler function
   */
  once<T>(event: string, callback: EventCallback<T>): void {
    const wrapper = (payload: T) => {
      callback(payload);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Check if an event has any listeners
   * @param event - Event name
   */
  hasListeners(event: string): boolean {
    return (this.listeners.get(event)?.size ?? 0) > 0;
  }

  /**
   * Get count of listeners for an event
   * @param event - Event name
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Get event history for debugging
   * @param event - Optional filter by event name
   */
  getHistory(event?: string): EventHistoryEntry[] {
    if (event) {
      return this.history.filter((entry) => entry.event === event);
    }
    return [...this.history];
  }

  /**
   * Clear all listeners and history
   */
  clear(): void {
    this.listeners.clear();
    this.history = [];
  }

  /**
   * Clear only history (keep listeners)
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Remove all listeners for a specific event
   * @param event - Event name
   */
  clearEvent(event: string): void {
    this.listeners.delete(event);
  }
}

// Singleton instance for app-wide use
export const eventBus = new EventBus({
  debug: typeof process !== 'undefined' && process.env?.NODE_ENV === 'development',
});
