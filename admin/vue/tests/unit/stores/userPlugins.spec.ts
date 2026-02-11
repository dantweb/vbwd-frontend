import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock the userPluginApi
vi.mock('@/api/userPluginApi', () => ({
  userPluginApi: {
    fetchPlugins: vi.fn(),
    fetchPluginDetail: vi.fn(),
    savePluginConfig: vi.fn(),
    enablePlugin: vi.fn(),
    disablePlugin: vi.fn(),
    installPlugin: vi.fn(),
    uninstallPlugin: vi.fn()
  }
}));

import { useUserPluginsStore } from '@/stores/userPlugins';
import { userPluginApi } from '@/api/userPluginApi';

const mockPlugins = [
  { name: 'landing1', version: '1.0.0', description: 'Landing page', status: 'active' as const, hasConfig: true },
  { name: 'checkout', version: '1.0.0', description: 'Checkout page', status: 'inactive' as const, hasConfig: true }
];

const mockDetail = {
  name: 'landing1',
  version: '1.0.0',
  description: 'Landing page',
  author: '',
  status: 'active' as const,
  dependencies: [],
  configSchema: {
    heroTitle: { type: 'string', default: 'Choose Your Plan', description: 'Main heading' }
  },
  adminConfig: {
    tabs: [{ id: 'general', label: 'General', fields: [
      { key: 'heroTitle', label: 'Hero Title', component: 'input', inputType: 'text' }
    ]}]
  },
  savedConfig: { heroTitle: 'Custom Title' }
};

describe('User Plugins Store', () => {
  let store: ReturnType<typeof useUserPluginsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUserPluginsStore();
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    expect(store.plugins).toEqual([]);
    expect(store.pluginDetail).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  describe('fetchPlugins', () => {
    it('fetches plugins from API and populates state', async () => {
      vi.mocked(userPluginApi.fetchPlugins).mockResolvedValue(mockPlugins);

      await store.fetchPlugins();

      expect(store.plugins).toHaveLength(2);
      expect(store.plugins[0].name).toBe('landing1');
      expect(store.plugins[1].name).toBe('checkout');
      expect(store.loading).toBe(false);
    });

    it('sets error state on API failure', async () => {
      vi.mocked(userPluginApi.fetchPlugins).mockRejectedValue(new Error('Connection refused'));

      await expect(store.fetchPlugins()).rejects.toThrow('Connection refused');
      expect(store.error).toBe('Connection refused');
    });
  });

  describe('fetchPluginDetail', () => {
    it('fetches plugin detail and sets state', async () => {
      vi.mocked(userPluginApi.fetchPluginDetail).mockResolvedValue(mockDetail);

      await store.fetchPluginDetail('landing1');

      expect(store.pluginDetail).not.toBeNull();
      expect(store.pluginDetail!.name).toBe('landing1');
      expect(store.pluginDetail!.configSchema).toHaveProperty('heroTitle');
      expect(store.pluginDetail!.savedConfig).toEqual({ heroTitle: 'Custom Title' });
    });

    it('sets error on failure', async () => {
      vi.mocked(userPluginApi.fetchPluginDetail).mockRejectedValue(new Error('Not found'));

      await expect(store.fetchPluginDetail('unknown')).rejects.toThrow('Not found');
      expect(store.error).toBe('Not found');
    });
  });

  describe('savePluginConfig', () => {
    it('calls API and updates detail savedConfig', async () => {
      vi.mocked(userPluginApi.fetchPluginDetail).mockResolvedValue(mockDetail);
      await store.fetchPluginDetail('landing1');

      vi.mocked(userPluginApi.savePluginConfig).mockResolvedValue();

      const newConfig = { heroTitle: 'New Title' };
      await store.savePluginConfig('landing1', newConfig);

      expect(userPluginApi.savePluginConfig).toHaveBeenCalledWith('landing1', newConfig);
      expect(store.pluginDetail!.savedConfig).toEqual(newConfig);
    });
  });

  describe('enablePlugin', () => {
    it('calls API and updates plugin status to active', async () => {
      vi.mocked(userPluginApi.fetchPlugins).mockResolvedValue([...mockPlugins]);
      await store.fetchPlugins();

      vi.mocked(userPluginApi.enablePlugin).mockResolvedValue();

      await store.enablePlugin('checkout');

      expect(userPluginApi.enablePlugin).toHaveBeenCalledWith('checkout');
      expect(store.plugins.find(p => p.name === 'checkout')!.status).toBe('active');
    });
  });

  describe('disablePlugin', () => {
    it('calls API and updates plugin status to inactive', async () => {
      vi.mocked(userPluginApi.fetchPlugins).mockResolvedValue([...mockPlugins]);
      await store.fetchPlugins();

      vi.mocked(userPluginApi.disablePlugin).mockResolvedValue();

      await store.disablePlugin('landing1');

      expect(userPluginApi.disablePlugin).toHaveBeenCalledWith('landing1');
      expect(store.plugins.find(p => p.name === 'landing1')!.status).toBe('inactive');
    });
  });

  describe('installPlugin', () => {
    it('calls API and updates status to inactive', async () => {
      const pluginsWithUninstalled = [
        ...mockPlugins,
        { name: 'new-plugin', version: '1.0.0', description: 'New', status: 'uninstalled' as const, hasConfig: false }
      ];
      vi.mocked(userPluginApi.fetchPlugins).mockResolvedValue(pluginsWithUninstalled);
      await store.fetchPlugins();

      vi.mocked(userPluginApi.installPlugin).mockResolvedValue();

      await store.installPlugin('new-plugin');

      expect(userPluginApi.installPlugin).toHaveBeenCalledWith('new-plugin');
      expect(store.plugins.find(p => p.name === 'new-plugin')!.status).toBe('inactive');
    });
  });

  describe('uninstallPlugin', () => {
    it('calls API and updates status to uninstalled', async () => {
      vi.mocked(userPluginApi.fetchPlugins).mockResolvedValue([...mockPlugins]);
      await store.fetchPlugins();

      vi.mocked(userPluginApi.uninstallPlugin).mockResolvedValue();

      await store.uninstallPlugin('landing1');

      expect(userPluginApi.uninstallPlugin).toHaveBeenCalledWith('landing1');
      expect(store.plugins.find(p => p.name === 'landing1')!.status).toBe('uninstalled');
    });
  });
});
