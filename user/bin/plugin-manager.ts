#!/usr/bin/env npx tsx
/**
 * VBWD User Plugin Manager CLI
 *
 * Usage:
 *   npm run plugin list
 *   npm run plugin install <name>
 *   npm run plugin uninstall <name>
 *   npm run plugin activate <name>
 *   npm run plugin deactivate <name>
 *   npm run plugin help
 */

// Import from source directly for Node.js CLI (bypasses browser-externalized dist)
import { PluginManagerCLI } from '../../core/src/cli/PluginManagerCLI';
import { PluginRegistry } from '../../core/src/plugins/PluginRegistry';

// Create a new plugin registry
const registry = new PluginRegistry();

// Initialize CLI with configuration
const cli = new PluginManagerCLI(registry, {
  pluginsDir: './vue/src/plugins',
  configFile: './plugins.json'
});

// Run CLI with command-line arguments
cli.run(process.argv.slice(2))
  .catch((error: Error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
