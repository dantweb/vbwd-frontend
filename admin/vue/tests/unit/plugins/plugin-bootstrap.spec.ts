import { describe, it, expect, beforeEach } from 'vitest'
import { PluginRegistry, PlatformSDK, PluginStatus } from '@vbwd/view-component'
import type { IPlugin, IPlatformSDK } from '@vbwd/view-component'

function createTestPlugin(name = 'test-plugin'): IPlugin {
  return {
    name,
    version: '1.0.0',
    install(sdk: IPlatformSDK) {
      sdk.addComponent('TestWidget', () => Promise.resolve({ default: {} }) as Promise<{ default: unknown }>)
    },
    activate() {},
    deactivate() {}
  }
}

describe('Plugin Bootstrap', () => {
  let registry: PluginRegistry
  let sdk: PlatformSDK

  beforeEach(() => {
    registry = new PluginRegistry()
    sdk = new PlatformSDK()
  })

  it('registers a plugin in the registry', () => {
    const plugin = createTestPlugin()
    registry.register(plugin)

    const registered = registry.get('test-plugin')
    expect(registered).toBeDefined()
    expect(registered!.name).toBe('test-plugin')
    expect(registered!.status).toBe(PluginStatus.REGISTERED)
  })

  it('install registers component in SDK', async () => {
    const plugin = createTestPlugin()
    registry.register(plugin)
    await registry.installAll(sdk)

    const components = sdk.getComponents()
    expect(components).toHaveProperty('TestWidget')
    expect(typeof components['TestWidget']).toBe('function')
  })

  it('activate sets status to ACTIVE', async () => {
    const plugin = createTestPlugin()
    registry.register(plugin)
    await registry.installAll(sdk)
    await registry.activate('test-plugin')

    const meta = registry.get('test-plugin')
    expect(meta!.status).toBe(PluginStatus.ACTIVE)
  })

  it('SDK provides api and events objects', () => {
    expect(sdk.api).toBeDefined()
    expect(sdk.events).toBeDefined()
  })

  it('routes are collected in SDK', async () => {
    const routePlugin: IPlugin = {
      name: 'route-plugin',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addRoute({
          path: '/test',
          name: 'TestRoute',
          component: () => Promise.resolve({ default: {} }) as Promise<{ default: unknown }>
        })
      }
    }

    registry.register(routePlugin)
    await registry.installAll(sdk)

    const routes = sdk.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].path).toBe('/test')
  })

  it('deactivate changes status to INACTIVE', async () => {
    const plugin = createTestPlugin()
    registry.register(plugin)
    await registry.installAll(sdk)
    await registry.activate('test-plugin')
    await registry.deactivate('test-plugin')

    const meta = registry.get('test-plugin')
    expect(meta!.status).toBe(PluginStatus.INACTIVE)
  })
})
