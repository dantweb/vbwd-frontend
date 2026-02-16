/**
 * Admin Extension Registry
 *
 * Generic system for loading and accessing plugin extensions.
 * Keeps the core admin app agnostic to specific plugins.
 */

import type { Component } from 'vue';

export interface AdminExtension {
  userDetailsSections?: Component[];
}

class ExtensionRegistry {
  private extensions: Map<string, AdminExtension> = new Map();

  /**
   * Register a plugin extension
   */
  register(pluginName: string, extension: AdminExtension): void {
    this.extensions.set(pluginName, extension);
  }

  /**
   * Get all extensions for a specific hook point
   */
  getUserDetailsSections(): Component[] {
    const sections: Component[] = [];
    this.extensions.forEach((ext) => {
      if (ext.userDetailsSections) {
        sections.push(...ext.userDetailsSections);
      }
    });
    return sections;
  }

  /**
   * Get extension by plugin name
   */
  get(pluginName: string): AdminExtension | undefined {
    return this.extensions.get(pluginName);
  }

  /**
   * Check if extension exists
   */
  has(pluginName: string): boolean {
    return this.extensions.has(pluginName);
  }

  /**
   * Clear all extensions
   */
  clear(): void {
    this.extensions.clear();
  }
}

export const extensionRegistry = new ExtensionRegistry();
