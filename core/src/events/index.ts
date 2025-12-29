/**
 * Events module exports
 */

// EventBus class and singleton
export { EventBus, eventBus } from './EventBus';

// Event constants and types
export {
  AppEvents,
  type AppEventType,
  type AuthLoginPayload,
  type AuthLogoutPayload,
  type UserRegisteredPayload,
  type UserUpdatedPayload,
  type SubscriptionPayload,
  type PaymentPayload,
  type NotificationPayload,
  type ModalPayload,
  type LoadingPayload,
  type WSMessagePayload,
  type PluginPayload,
  type EventPayloadMap,
} from './events';
