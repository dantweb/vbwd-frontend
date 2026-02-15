.PHONY: up down build dev logs clean install test lint test-e2e test-e2e-ui test-e2e-headed test-e2e-debug test-e2e-file test-e2e-seed test-e2e-report playwright-install

# Start production containers
up:
	docker-compose up -d user-app admin-app

# Start with rebuild
up-build:
	docker-compose up -d --build user-app admin-app

# Stop services
down:
	docker-compose down

# Build containers
build:
	docker-compose build

# Build containers without cache
build-nocache:
	docker-compose build --no-cache

# Clean Docker cache and rebuild
rebuild-nocache: clean
	docker-compose build --no-cache user-app admin-app

# Start development mode
dev:
	docker-compose --profile dev up -d user-dev admin-dev

# View logs
logs:
	docker-compose logs -f

# Clean up
clean:
	docker-compose down -v
	rm -rf user/vue/node_modules admin/vue/node_modules
	rm -rf user/vue/dist admin/vue/dist

# Install dependencies locally
install:
	cd user/vue && npm install
	cd admin/vue && npm install

# Run tests
test:
	cd user/vue && npm test
	cd admin/vue && npm test

# Lint
lint:
	cd user/vue && npm run lint
	cd admin/vue && npm run lint

# ============================================
# Playwright E2E Tests (user app)
# ============================================

# Run all E2E tests (headless)
# Set VITE_BACKEND_URL for Linux (outside Docker)
test-e2e:
	cd user && VITE_BACKEND_URL=http://localhost:5000 npx playwright test

# Run E2E tests with Playwright UI mode
test-e2e-ui:
	cd user && VITE_BACKEND_URL=http://localhost:5000 npx playwright test --ui

# Run E2E tests in headed browser (visible)
test-e2e-headed:
	cd user && VITE_BACKEND_URL=http://localhost:5000 npx playwright test --headed

# Run E2E tests in debug mode
test-e2e-debug:
	cd user && VITE_BACKEND_URL=http://localhost:5000 npx playwright test --debug

# Run specific E2E test file
# Usage: make test-e2e-file FILE=auth.spec.ts
test-e2e-file:
	cd user && VITE_BACKEND_URL=http://localhost:5000 npx playwright test $(FILE)

# Run E2E tests with test data seeding
test-e2e-seed:
	cd user && VITE_BACKEND_URL=http://localhost:5000 TEST_DATA_SEED=true npx playwright test

# Show Playwright test report
test-e2e-report:
	cd user && npx playwright show-report

# Install Playwright browsers
playwright-install:
	cd user && npx playwright install
