# VBWD Frontend

Vue.js applications for the VBWD SaaS platform.

## Applications

- **User App** (port 8080): User-facing application
- **Admin App** (port 8081): Admin backoffice

## Tech Stack

- **Framework**: Vue.js 3
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router

## Quick Start

```bash
# Clone the repository
git clone https://github.com/dantweb/vbwd-frontend.git
cd vbwd-frontend

# Start development mode
make dev

# Or start production containers
make up
```

## Development Commands

```bash
make up           # Start production containers
make up-build     # Start with rebuild
make down         # Stop services
make dev          # Start development mode with hot reload
make logs         # View logs
make install      # Install dependencies locally
make test         # Run tests
make lint         # Run linter
make clean        # Clean up
```

## Project Structure

```
├── user/
│   └── vue/           # User-facing Vue.js app
│       ├── src/
│       │   ├── components/
│       │   ├── router/
│       │   ├── stores/
│       │   └── views/
│       └── package.json
├── admin/
│   └── vue/           # Admin Vue.js app
│       ├── src/
│       │   ├── components/
│       │   ├── router/
│       │   ├── stores/
│       │   └── views/
│       └── package.json
└── container/         # Docker configuration
```

## Development URLs

- User App: http://localhost:5173
- Admin App: http://localhost:5174

## Production URLs

- User App: http://localhost:8080
- Admin App: http://localhost:8081

## License

CC0 1.0 Universal (Public Domain)
