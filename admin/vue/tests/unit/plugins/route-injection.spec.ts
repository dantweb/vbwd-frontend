import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory, type RouteRecordRaw } from 'vue-router'
import { PluginRegistry, PlatformSDK } from '@vbwd/view-component'
import type { IPlugin, IPlatformSDK } from '@vbwd/view-component'
import { h } from 'vue'

const DummyPage = {
  name: 'DummyPage',
  render() {
    return h('div', 'Plugin Page')
  }
}

const AdminLayout = {
  name: 'AdminLayout',
  render() {
    return h('div', { class: 'admin-layout' }, [h('router-view')])
  }
}

function createPluginWithRoute(): IPlugin {
  return {
    name: 'page-plugin',
    version: '1.0.0',
    install(sdk: IPlatformSDK) {
      sdk.addRoute({
        path: 'plugin-page',
        name: 'PluginPage',
        component: () => Promise.resolve({ default: DummyPage }) as Promise<{ default: unknown }>
      })
    }
  }
}

function createTestRouter(): ReturnType<typeof createRouter> {
  const routes: RouteRecordRaw[] = [
    {
      path: '/admin',
      name: 'admin',
      component: AdminLayout,
      children: [
        { path: 'dashboard', name: 'dashboard', component: DummyPage }
      ]
    }
  ]
  return createRouter({ history: createMemoryHistory(), routes })
}

describe('Route Injection', () => {
  let registry: PluginRegistry
  let sdk: PlatformSDK
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    registry = new PluginRegistry()
    sdk = new PlatformSDK()
    router = createTestRouter()
  })

  it('plugin route is added to router', async () => {
    const plugin = createPluginWithRoute()
    registry.register(plugin)
    await registry.installAll(sdk)

    for (const route of sdk.getRoutes()) {
      router.addRoute('admin', route as RouteRecordRaw)
    }

    const routes = router.getRoutes()
    const pluginRoute = routes.find(r => r.name === 'PluginPage')
    expect(pluginRoute).toBeDefined()
  })

  it('plugin route is accessible via router', async () => {
    const plugin = createPluginWithRoute()
    registry.register(plugin)
    await registry.installAll(sdk)

    for (const route of sdk.getRoutes()) {
      router.addRoute('admin', route as RouteRecordRaw)
    }

    const resolved = router.resolve({ name: 'PluginPage' })
    expect(resolved.matched.length).toBeGreaterThan(0)
    expect(resolved.path).toBe('/admin/plugin-page')
  })

  it('plugin route inherits admin layout (nested under /admin)', async () => {
    const plugin = createPluginWithRoute()
    registry.register(plugin)
    await registry.installAll(sdk)

    for (const route of sdk.getRoutes()) {
      router.addRoute('admin', route as RouteRecordRaw)
    }

    const resolved = router.resolve({ name: 'PluginPage' })
    // Should be nested under /admin
    expect(resolved.path).toContain('/admin/')
    // Should have admin layout in matched routes
    expect(resolved.matched[0].components?.default).toBe(AdminLayout)
  })
})
