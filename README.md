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
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright

## Quick Start

```bash
# Install dependencies
make install

# Start development mode
make dev

# Or start production containers
make up
```

## Project Structure

```
vbwd-frontend/
├── core/              # Shared SDK (@vbwd/core-component, @vbwd/view-component)
├── user/              # User-facing application
│   └── vue/
│       ├── src/
│       └── tests/
│           ├── unit/      # Vitest unit tests
│           └── e2e/       # Playwright E2E tests
├── admin/             # Admin backoffice application
│   └── vue/
│       ├── src/
│       └── tests/unit/
├── Makefile
└── docker-compose.yaml
```

## Development URLs

- User App: http://localhost:5173 (dev) / http://localhost:8080 (prod)
- Admin App: http://localhost:5174 (dev) / http://localhost:8081 (prod)

---

## Testing

### Unit Tests (Vitest)

Unit tests run with Vitest in each application.

```bash
# Run all unit tests (user + admin)
make test

# Run tests for specific app
cd user/vue && npm test
cd admin/vue && npm test

# Run in watch mode
cd user/vue && npm run test:watch

# Run with coverage
cd user/vue && npm run test:coverage
```

### E2E Tests (Playwright)

E2E tests require the backend to be running.

#### Prerequisites

```bash
# Install Playwright browsers (first time only)
make playwright-install

# Start backend services
cd ../vbwd-backend && make up
```

#### Running E2E Tests

```bash
# Run all E2E tests (headless)
make test-e2e

# Run with visible browser
make test-e2e-headed

# Run with Playwright UI mode (interactive)
make test-e2e-ui

# Run in debug mode
make test-e2e-debug

# Run specific test file
make test-e2e-file FILE=auth.spec.ts

# Run with test data seeding
make test-e2e-seed

# View test report after run
make test-e2e-report
```

#### E2E Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BACKEND_URL` | `http://host.docker.internal:5000` | Backend API URL |
| `TEST_DATA_SEED` | `false` | Seed test data before tests |
| `TEST_DATA_CLEANUP` | `false` | Cleanup test data after tests |

**Linux (outside Docker):**
```bash
VITE_BACKEND_URL=http://localhost:5000 make test-e2e
```

### Linting

```bash
# Run ESLint on all apps
make lint

# Fix linting issues
cd user/vue && npm run lint -- --fix
```

---

## Make Commands Reference

| Command | Description |
|---------|-------------|
| **Development** |
| `make up` | Start production containers |
| `make up-build` | Rebuild and start containers |
| `make down` | Stop all containers |
| `make dev` | Start development mode (hot reload) |
| `make logs` | View container logs |
| `make install` | Install npm dependencies |
| `make clean` | Remove containers and node_modules |
| **Testing** |
| `make test` | Run unit tests (user + admin) |
| `make lint` | Run ESLint |
| `make test-e2e` | Run Playwright E2E tests (headless) |
| `make test-e2e-ui` | Run E2E with Playwright UI |
| `make test-e2e-headed` | Run E2E in visible browser |
| `make test-e2e-debug` | Run E2E in debug mode |
| `make test-e2e-seed` | Run E2E with test data seeding |
| `make test-e2e-file FILE=x` | Run specific E2E test file |
| `make test-e2e-report` | Show Playwright report |
| `make playwright-install` | Install Playwright browsers |

---

## Test Data

E2E tests use the following credentials (seeded by backend):

| Role | Email | Password |
|------|-------|----------|
| User | test@example.com | TestPass123@ |
| Admin | admin@example.com | AdminPass123@ |

---

## Troubleshooting

### Permission denied errors

If you see permission errors on `node_modules` or `test-results`:
```bash
docker run --rm -v $(pwd)/user:/app alpine chown -R $(id -u):$(id -g) /app/node_modules /app/test-results
```

### Backend not ready

Ensure backend is running:
```bash
cd ../vbwd-backend && make up
curl http://localhost:5000/api/v1/health
```

### Proxy errors (host.docker.internal)

On Linux outside Docker, set the backend URL:
```bash
VITE_BACKEND_URL=http://localhost:5000 make test-e2e
```

---

## License

CC0 1.0 Universal (Public Domain)
