# VBWD User Portal

Vue 3 user-facing application for VBWD platform subscribers.

## Features

- User dashboard
- Profile management
- Subscription overview
- Invoice viewing
- Plan selection
- Authentication (login/logout)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs on http://localhost:5173

### Build

```bash
npm run build
```

### Testing

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Project Structure

```
user/
├── bin/                  # CLI tools
│   └── plugin-manager.ts # Plugin management CLI
├── vue/
│   ├── plugins/          # Plugin directory
│   │   └── wizzard_form/ # Example plugin
│   ├── src/
│   │   ├── layouts/      # Layout components
│   │   ├── router/       # Vue Router config
│   │   └── views/        # Page components
│   └── tests/            # Tests
├── plugins.json          # Plugin configuration
└── package.json
```

## Plugin System

The user app supports a plugin architecture for extending functionality.

### Plugin CLI Commands

```bash
# List all plugins with their status
npm run plugin list

# Install a plugin from local plugins directory
npm run plugin install <name>

# Uninstall a plugin (removes from config)
npm run plugin uninstall <name>

# Activate an installed plugin
npm run plugin activate <name>

# Deactivate a plugin without removing it
npm run plugin deactivate <name>

# Show help
npm run plugin help
```

### Example

```bash
$ npm run plugin list

VBWD Plugin Manager v1.0.0

NAME                VERSION     STATUS        DESCRIPTION
──────────────────────────────────────────────────────────────────────
wizzard-form        1.0.0       active        Submission wizard plugin

Total: 1 plugins (1 active, 0 inactive)
```

### Plugin Configuration

Plugins are configured in `plugins.json`:

```json
{
  "plugins": {
    "wizzard-form": {
      "enabled": true,
      "version": "1.0.0",
      "installedAt": "2026-01-05T10:30:00.000Z",
      "source": "local"
    }
  }
}
```

### Existing Plugins

| Plugin | Description | Location |
|--------|-------------|----------|
| `wizzard_form` | Submission wizard for forms | `vue/plugins/wizzard_form/` |

### Creating a Plugin

1. Create plugin directory in `vue/plugins/<plugin-name>/`
2. Add `package.json` with version info
3. Export plugin object implementing `IPlugin` interface
4. Install via CLI: `npm run plugin install <plugin-name>`
5. Activate: `npm run plugin activate <plugin-name>`

## Views

| View | Description |
|------|-------------|
| `Dashboard.vue` | User dashboard with overview |
| `Profile.vue` | User profile management |
| `Subscription.vue` | Current subscription details |
| `Invoices.vue` | Invoice history |
| `Plans.vue` | Available plans |
| `Login.vue` | Authentication |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api/v1` |

## Architecture

The user app uses a hybrid architecture:

- **Flat views** for core functionality (dashboard, profile, subscription, invoices)
- **Plugin system** for value-added features and custom workflows

## Related Documentation

- [Core SDK](../core/README.md)
- [Admin App](../admin/vue/README.md)

## License

CC0-1.0 Universal (Public Domain)
