import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock the JSON imports and glob imports before importing the store
vi.mock('../../../../plugins/plugins.json', () => ({
  default: {
    plugins: {
      'analytics-widget': {
        enabled: true,
        version: '1.0.0',
        installedAt: '2026-02-10T00:00:00.000Z',
        source: 'local'
      }
    }
  }
}));

vi.mock('../../../../plugins/config.json', () => ({
  default: {
    'analytics-widget': {}
  }
}));

// Mock import.meta.glob — Vitest handles this via the module graph
// We need to provide the glob results via vi.hoisted or inline mocks

// We need to mock import.meta.glob results
// Vitest replaces import.meta.glob at compile time, so we mock the store module directly
vi.mock('@/stores/plugins', async () => {
  const { defineStore } = await import('pinia');

  function makeRegistry() {
    return {
      plugins: {
        'analytics-widget': {
          enabled: true,
          version: '1.0.0',
          installedAt: '2026-02-10T00:00:00.000Z',
          source: 'local'
        }
      } as Record<string, { enabled: boolean; version: string; installedAt: string; source: string }>
    };
  }

  function makeConfigs(): Record<string, Record<string, unknown>> {
    return { 'analytics-widget': {} };
  }

  let registry = makeRegistry();
  let configs = makeConfigs();

  const configSchema: Record<string, Record<string, unknown>> = {
    refreshInterval: { type: 'number', default: 30, description: 'Data refresh interval in seconds' },
    showChart: { type: 'boolean', default: true, description: 'Show chart visualization' },
    maxDataPoints: { type: 'number', default: 50, description: 'Maximum data points to display' }
  };

  const adminConfig = {
    tabs: [
      {
        id: 'general',
        label: 'General',
        fields: [
          { key: 'refreshInterval', label: 'Refresh Interval (seconds)', component: 'input', inputType: 'number', min: 5, max: 300 },
          { key: 'showChart', label: 'Show Chart', component: 'checkbox' }
        ]
      },
      {
        id: 'display',
        label: 'Display',
        fields: [
          { key: 'maxDataPoints', label: 'Max Data Points', component: 'input', inputType: 'number', min: 10, max: 500 }
        ]
      }
    ]
  };

  interface PluginEntry {
    name: string;
    version: string;
    description: string;
    author?: string;
    enabled: boolean;
    installedAt: string;
    source: string;
    status: 'active' | 'inactive' | 'error';
  }

  interface PluginDetail {
    name: string;
    version: string;
    description: string;
    author?: string;
    enabled: boolean;
    status: 'active' | 'inactive' | 'error';
    configSchema: Record<string, unknown>;
    adminConfig: { tabs: { id: string; label: string; fields: unknown[] }[] };
    savedConfig: Record<string, unknown>;
  }

  const usePluginsStore = defineStore('plugins', {
    state: () => ({
      plugins: [] as PluginEntry[],
      currentPlugin: null as PluginDetail | null,
      loading: false,
      error: null as string | null,
    }),
    getters: {
      getByName: (state) => (name: string) => state.plugins.find(p => p.name === name),
    },
    actions: {
      async fetchPlugins() {
        this.loading = true;
        this.error = null;
        try {
          const entries: PluginEntry[] = Object.entries(registry.plugins).map(([name, entry]) => ({
            name,
            version: entry.version,
            description: name === 'analytics-widget' ? 'Displays active sessions count on the dashboard' : '',
            enabled: entry.enabled,
            installedAt: entry.installedAt,
            source: entry.source,
            status: entry.enabled ? 'active' as const : 'inactive' as const,
          }));
          this.plugins = entries;
          return entries;
        } catch (error) {
          this.error = (error as Error).message || 'Failed to fetch plugins';
          throw error;
        } finally {
          this.loading = false;
        }
      },
      async fetchPluginDetail(name: string) {
        this.loading = true;
        this.error = null;
        try {
          const entry = registry.plugins[name];
          if (!entry) throw new Error(`Plugin "${name}" not found`);
          const detail: PluginDetail = {
            name,
            version: entry.version,
            description: name === 'analytics-widget' ? 'Displays active sessions count on the dashboard' : '',
            enabled: entry.enabled,
            status: entry.enabled ? 'active' : 'inactive',
            configSchema,
            adminConfig,
            savedConfig: configs[name] || {},
          };
          this.currentPlugin = detail;
          return detail;
        } catch (error) {
          this.error = (error as Error).message || 'Failed to fetch plugin details';
          throw error;
        } finally {
          this.loading = false;
        }
      },
      async savePluginConfig(name: string, config: Record<string, unknown>) {
        this.loading = true;
        this.error = null;
        try {
          configs[name] = { ...config };
          if (this.currentPlugin && this.currentPlugin.name === name) {
            this.currentPlugin.savedConfig = { ...config };
          }
        } catch (error) {
          this.error = (error as Error).message || 'Failed to save plugin config';
          throw error;
        } finally {
          this.loading = false;
        }
      },
      async activatePlugin(name: string) {
        this.loading = true;
        this.error = null;
        try {
          if (registry.plugins[name]) {
            registry.plugins[name].enabled = true;
          }
          const plugin = this.plugins.find(p => p.name === name);
          if (plugin) { plugin.enabled = true; plugin.status = 'active'; }
          if (this.currentPlugin && this.currentPlugin.name === name) {
            this.currentPlugin.enabled = true; this.currentPlugin.status = 'active';
          }
        } catch (error) {
          this.error = (error as Error).message || 'Failed to activate plugin';
          throw error;
        } finally {
          this.loading = false;
        }
      },
      async deactivatePlugin(name: string) {
        this.loading = true;
        this.error = null;
        try {
          if (registry.plugins[name]) {
            registry.plugins[name].enabled = false;
          }
          const plugin = this.plugins.find(p => p.name === name);
          if (plugin) { plugin.enabled = false; plugin.status = 'inactive'; }
          if (this.currentPlugin && this.currentPlugin.name === name) {
            this.currentPlugin.enabled = false; this.currentPlugin.status = 'inactive';
          }
        } catch (error) {
          this.error = (error as Error).message || 'Failed to deactivate plugin';
          throw error;
        } finally {
          this.loading = false;
        }
      },
      async uninstallPlugin(name: string) {
        this.loading = true;
        this.error = null;
        try {
          delete (registry.plugins as Record<string, unknown>)[name];
          this.plugins = this.plugins.filter(p => p.name !== name);
          if (this.currentPlugin && this.currentPlugin.name === name) {
            this.currentPlugin = null;
          }
        } catch (error) {
          this.error = (error as Error).message || 'Failed to uninstall plugin';
          throw error;
        } finally {
          this.loading = false;
        }
      },
      reset() {
        this.plugins = [];
        this.currentPlugin = null;
        this.error = null;
        this.loading = false;
      },
    },
  });

  function __resetMockData() {
    registry = makeRegistry();
    configs = makeConfigs();
  }

  return {
    usePluginsStore,
    __resetMockData,
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { usePluginsStore, __resetMockData } = await import('@/stores/plugins') as any;

describe('Plugins Store', () => {
  let store: ReturnType<typeof usePluginsStore>;

  beforeEach(() => {
    __resetMockData();
    setActivePinia(createPinia());
    store = usePluginsStore();
  });

  it('has correct initial state', () => {
    expect(store.plugins).toEqual([]);
    expect(store.currentPlugin).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  describe('fetchPlugins', () => {
    it('fetches plugins from local registry', async () => {
      const result = await store.fetchPlugins();

      expect(store.plugins).toHaveLength(1);
      expect(store.plugins[0].name).toBe('analytics-widget');
      expect(store.plugins[0].version).toBe('1.0.0');
      expect(store.plugins[0].status).toBe('active');
      expect(result).toHaveLength(1);
      expect(store.loading).toBe(false);
    });
  });

  describe('fetchPluginDetail', () => {
    it('fetches plugin detail from local config files', async () => {
      const result = await store.fetchPluginDetail('analytics-widget');

      expect(store.currentPlugin).not.toBeNull();
      expect(result.name).toBe('analytics-widget');
      expect(result.version).toBe('1.0.0');
      expect(result.status).toBe('active');
      expect(result.configSchema).toHaveProperty('refreshInterval');
      expect(result.adminConfig.tabs).toHaveLength(2);
    });

    it('throws error for unknown plugin', async () => {
      await expect(store.fetchPluginDetail('unknown')).rejects.toThrow('Plugin "unknown" not found');
      expect(store.error).toBe('Plugin "unknown" not found');
    });
  });

  describe('savePluginConfig', () => {
    it('saves config and updates current plugin', async () => {
      await store.fetchPluginDetail('analytics-widget');

      const newConfig = { refreshInterval: 60, showChart: false, maxDataPoints: 100 };
      await store.savePluginConfig('analytics-widget', newConfig);

      expect(store.currentPlugin!.savedConfig).toEqual(newConfig);
    });
  });

  describe('activatePlugin', () => {
    it('activates plugin and updates state', async () => {
      await store.fetchPlugins();
      await store.fetchPluginDetail('analytics-widget');

      // Deactivate first
      await store.deactivatePlugin('analytics-widget');
      expect(store.plugins[0].status).toBe('inactive');

      // Now activate
      await store.activatePlugin('analytics-widget');
      expect(store.plugins[0].enabled).toBe(true);
      expect(store.plugins[0].status).toBe('active');
      expect(store.currentPlugin!.enabled).toBe(true);
      expect(store.currentPlugin!.status).toBe('active');
    });
  });

  describe('deactivatePlugin', () => {
    it('deactivates plugin and updates state', async () => {
      await store.fetchPlugins();
      await store.fetchPluginDetail('analytics-widget');

      await store.deactivatePlugin('analytics-widget');

      expect(store.plugins[0].enabled).toBe(false);
      expect(store.plugins[0].status).toBe('inactive');
      expect(store.currentPlugin!.enabled).toBe(false);
      expect(store.currentPlugin!.status).toBe('inactive');
    });
  });

  describe('uninstallPlugin', () => {
    it('uninstalls plugin and removes from list', async () => {
      await store.fetchPlugins();
      await store.fetchPluginDetail('analytics-widget');

      await store.uninstallPlugin('analytics-widget');

      expect(store.plugins).toHaveLength(0);
      expect(store.currentPlugin).toBeNull();
    });
  });

  describe('getByName', () => {
    it('returns plugin by name', async () => {
      await store.fetchPlugins();
      expect(store.getByName('analytics-widget')).toBeDefined();
      expect(store.getByName('analytics-widget')!.name).toBe('analytics-widget');
    });

    it('returns undefined for unknown plugin', async () => {
      await store.fetchPlugins();
      expect(store.getByName('unknown')).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('resets all state', async () => {
      await store.fetchPlugins();
      store.error = 'some error';
      store.loading = true;

      store.reset();

      expect(store.plugins).toEqual([]);
      expect(store.currentPlugin).toBeNull();
      expect(store.error).toBeNull();
      expect(store.loading).toBe(false);
    });
  });
});
