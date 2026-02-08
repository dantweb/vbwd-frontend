import { describe, it, expect, beforeEach } from 'vitest'
import { PluginRegistry, PlatformSDK, PluginStatus } from '@vbwd/view-component'
import type { IPlugin, IPlatformSDK } from '@vbwd/view-component'

function createTestPlugin(overrides: Partial<IPlugin> = {}): IPlugin {
  return {
    name: 'user-test-plugin',
    version: '1.0.0',
    install(sdk: IPlatformSDK) {
      sdk.addComponent('TestWidget', () => Promise.resolve({ default: {} }) as Promise<{ default: unknown }>)
    },
    activate() {},
    deactivate() {},
    ...overrides
  }
}

describe('User App Plugin Bootstrap', () => {
  let registry: PluginRegistry
  let sdk: PlatformSDK

  beforeEach(() => {
    registry = new PluginRegistry()
    sdk = new PlatformSDK()
  })

  // --- Core Bootstrap ---

  it('should instantiate registry and SDK', () => {
    expect(registry).toBeInstanceOf(PluginRegistry)
    expect(sdk).toBeInstanceOf(PlatformSDK)
    expect(sdk.api).toBeDefined()
    expect(sdk.events).toBeDefined()
  })

  it('should register a plugin in user context', () => {
    const plugin = createTestPlugin()
    registry.register(plugin)

    const registered = registry.get('user-test-plugin')
    expect(registered).toBeDefined()
    expect(registered!.name).toBe('user-test-plugin')
    expect(registered!.status).toBe(PluginStatus.REGISTERED)
  })

  it('should register component in SDK during install', async () => {
    const plugin = createTestPlugin()
    registry.register(plugin)
    await registry.installAll(sdk)

    const components = sdk.getComponents()
    expect(components).toHaveProperty('TestWidget')
    expect(typeof components['TestWidget']).toBe('function')
  })

  it('should register route in SDK during install', async () => {
    const plugin = createTestPlugin({
      name: 'route-plugin',
      install(sdk: IPlatformSDK) {
        sdk.addRoute({
          path: '/user-plugin',
          name: 'UserPlugin',
          component: () => Promise.resolve({ default: {} }) as Promise<{ default: unknown }>
        })
      }
    })

    registry.register(plugin)
    await registry.installAll(sdk)

    const routes = sdk.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].path).toBe('/user-plugin')
  })

  it('should create store in SDK during install', async () => {
    const plugin = createTestPlugin({
      name: 'store-plugin',
      install(sdk: IPlatformSDK) {
        sdk.createStore('userPluginStore', {
          state: () => ({ count: 0 }),
          actions: { increment() { (this as Record<string, unknown>).count = ((this as Record<string, unknown>).count as number) + 1 } }
        })
      }
    })

    registry.register(plugin)
    await registry.installAll(sdk)

    expect(sdk.getStores()).toHaveProperty('userPluginStore')
  })

  it('should complete full lifecycle: register → install → activate → deactivate', async () => {
    const plugin = createTestPlugin()
    registry.register(plugin)
    expect(registry.get('user-test-plugin')!.status).toBe(PluginStatus.REGISTERED)

    await registry.installAll(sdk)
    expect(registry.get('user-test-plugin')!.status).toBe(PluginStatus.INSTALLED)

    await registry.activate('user-test-plugin')
    expect(registry.get('user-test-plugin')!.status).toBe(PluginStatus.ACTIVE)

    await registry.deactivate('user-test-plugin')
    expect(registry.get('user-test-plugin')!.status).toBe(PluginStatus.INACTIVE)
  })

  // --- User-Specific Scenarios ---

  it('should install multiple plugins in dependency order', async () => {
    const installed: string[] = []

    const pluginB: IPlugin = {
      name: 'dep-plugin',
      version: '1.0.0',
      install() { installed.push('dep') }
    }

    const pluginA: IPlugin = {
      name: 'main-plugin',
      version: '1.0.0',
      dependencies: ['dep-plugin'],
      install() { installed.push('main') }
    }

    registry.register(pluginA)
    registry.register(pluginB)
    await registry.installAll(sdk)

    expect(installed).toEqual(['dep', 'main'])
  })

  it('should install plugin with no hooks successfully', async () => {
    const minimalPlugin: IPlugin = {
      name: 'minimal',
      version: '1.0.0'
    }

    registry.register(minimalPlugin)
    await registry.installAll(sdk)
    await registry.activate('minimal')

    expect(registry.get('minimal')!.status).toBe(PluginStatus.ACTIVE)
  })

  it('should handle installAll with empty registry', async () => {
    await registry.installAll(sdk)

    expect(sdk.getRoutes()).toHaveLength(0)
    expect(Object.keys(sdk.getComponents())).toHaveLength(0)
    expect(Object.keys(sdk.getStores())).toHaveLength(0)
  })

  // --- Isolation from Admin ---

  it('should keep separate registry instances independent', () => {
    const registryA = new PluginRegistry()
    const registryB = new PluginRegistry()

    registryA.register(createTestPlugin({ name: 'plugin-a' }))
    registryB.register(createTestPlugin({ name: 'plugin-b' }))

    expect(registryA.get('plugin-a')).toBeDefined()
    expect(registryA.get('plugin-b')).toBeUndefined()
    expect(registryB.get('plugin-b')).toBeDefined()
    expect(registryB.get('plugin-a')).toBeUndefined()
  })

  it('should keep separate SDK instances independent', async () => {
    const sdkA = new PlatformSDK()
    const sdkB = new PlatformSDK()

    sdkA.addRoute({
      path: '/route-a',
      name: 'RouteA',
      component: () => Promise.resolve({ default: {} }) as Promise<{ default: unknown }>
    })

    expect(sdkA.getRoutes()).toHaveLength(1)
    expect(sdkB.getRoutes()).toHaveLength(0)
  })
})
