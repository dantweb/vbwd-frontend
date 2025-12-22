.PHONY: up down build dev logs clean install test lint

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
