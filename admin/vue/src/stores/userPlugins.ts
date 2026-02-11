import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userPluginApi } from '@/api/userPluginApi';
import type { UserPluginEntry, UserPluginDetail } from '@/api/userPluginApi';

export type { UserPluginEntry, UserPluginDetail };

export const useUserPluginsStore = defineStore('userPlugins', () => {
  const plugins = ref<UserPluginEntry[]>([]);
  const pluginDetail = ref<UserPluginDetail | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPlugins(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      plugins.value = await userPluginApi.fetchPlugins();
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPluginDetail(name: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      pluginDetail.value = await userPluginApi.fetchPluginDetail(name);
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function savePluginConfig(name: string, config: Record<string, unknown>): Promise<void> {
    try {
      await userPluginApi.savePluginConfig(name, config);
      if (pluginDetail.value && pluginDetail.value.name === name) {
        pluginDetail.value.savedConfig = config;
      }
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    }
  }

  async function enablePlugin(name: string): Promise<void> {
    try {
      await userPluginApi.enablePlugin(name);
      const plugin = plugins.value.find(p => p.name === name);
      if (plugin) plugin.status = 'active';
      if (pluginDetail.value?.name === name) pluginDetail.value.status = 'active';
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    }
  }

  async function disablePlugin(name: string): Promise<void> {
    try {
      await userPluginApi.disablePlugin(name);
      const plugin = plugins.value.find(p => p.name === name);
      if (plugin) plugin.status = 'inactive';
      if (pluginDetail.value?.name === name) pluginDetail.value.status = 'inactive';
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    }
  }

  async function installPlugin(name: string): Promise<void> {
    try {
      await userPluginApi.installPlugin(name);
      const plugin = plugins.value.find(p => p.name === name);
      if (plugin) plugin.status = 'inactive';
      if (pluginDetail.value?.name === name) pluginDetail.value.status = 'inactive';
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    }
  }

  async function uninstallPlugin(name: string): Promise<void> {
    try {
      await userPluginApi.uninstallPlugin(name);
      const plugin = plugins.value.find(p => p.name === name);
      if (plugin) plugin.status = 'uninstalled';
      if (pluginDetail.value?.name === name) pluginDetail.value.status = 'uninstalled';
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    }
  }

  return {
    plugins,
    pluginDetail,
    loading,
    error,
    fetchPlugins,
    fetchPluginDetail,
    savePluginConfig,
    enablePlugin,
    disablePlugin,
    installPlugin,
    uninstallPlugin
  };
});
