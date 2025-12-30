# VBWD View Component

Shared Vue 3 component library and TypeScript SDK for VBWD user and admin applications.

## Features

- 🔌 **Plugin System**: Extensible architecture for features
- 🌐 **API Client**: Type-safe HTTP client with interceptors
- 🔐 **Authentication**: JWT-based auth with token management
- 📡 **Event Bus**: Decoupled communication between plugins
- ✅ **Validation**: Zod-based schema validation
- 🎨 **UI Components**: Shared Vue 3 components
- 🪝 **Composables**: Reusable Vue composition functions
- 🔒 **Access Control**: Permission and role-based access

## Installation

```bash
npm install @vbwd/view-component
```

## Usage

```typescript
import { version, name } from '@vbwd/view-component';

console.log(`${name} v${version}`);
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Project Structure

```
src/
├── plugins/          # Sprint 1: Plugin system
├── api/              # Sprint 2: API client
├── auth/             # Sprint 3: Authentication
├── events/           # Sprint 4: Event bus
├── validation/       # Sprint 4: Validation
├── components/       # Sprint 5: UI components
├── composables/      # Sprint 6: Composables
├── access-control/   # Sprint 7: Access control
├── types/            # TypeScript types
└── utils/            # Utilities

tests/
├── unit/             # Unit tests
├── integration/      # Integration tests
└── fixtures/         # Test fixtures
```

## Testing Strategy

- **Unit Tests**: Test individual classes and functions
- **Integration Tests**: Test module interactions
- **Component Tests**: Test Vue components
- **Coverage Target**: ≥ 95%

## Sprint Status

- [x] Sprint 0: Foundation (Setup, TypeScript, Vitest)
- [ ] Sprint 1: Plugin System
- [ ] Sprint 2: API Client
- [ ] Sprint 3: Authentication
- [ ] Sprint 4: Event Bus & Validation
- [ ] Sprint 5: UI Components
- [ ] Sprint 6: Composables
- [ ] Sprint 7: Access Control
- [ ] Sprint 8: Integration & Documentation

## License

CC0-1.0 Universal (Public Domain)
