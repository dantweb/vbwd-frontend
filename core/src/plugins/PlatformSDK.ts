import type {
  IPlatformSDK,
  IApiClient,
  IEventBus,
  IRouteConfig,
  ComponentDefinition,
  IStoreOptions
} from './types';

/**
 * Platform SDK Implementation
 * Provides core APIs to plugins during installation
 */
export class PlatformSDK implements IPlatformSDK {
  // Core API instances
  public api: IApiClient = {};
  public events: IEventBus = {};

  // Registered routes
  private routes: IRouteConfig[] = [];

  // Registered components
  private components: Record<string, ComponentDefinition> = {};

  // Registered stores
  private stores: Record<string, IStoreOptions> = {};

  /**
   * Register a Vue Router route
   */
  addRoute(route: IRouteConfig): void {
    this.routes.push(route);
  }

  /**
   * Get all registered routes
   */
  getRoutes(): IRouteConfig[] {
    return this.routes;
  }

  /**
   * Register a global Vue component
   */
  addComponent(name: string, component: ComponentDefinition): void {
    this.components[name] = component;
  }

  /**
   * Get all registered components
   */
  getComponents(): Record<string, ComponentDefinition> {
    return this.components;
  }

  /**
   * Create a Pinia store
   */
  createStore(id: string, options: IStoreOptions): string {
    this.stores[id] = options;
    return id;
  }

  /**
   * Get all registered stores
   */
  getStores(): Record<string, IStoreOptions> {
    return this.stores;
  }
}
