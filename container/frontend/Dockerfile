# Build stage - Core library
FROM node:20-alpine AS build-core

WORKDIR /app/core
COPY core/package*.json ./
RUN npm install
COPY core/ ./
RUN npm run build

# Build stage - User app
# user/package.json has: "@vbwd/view-component": "file:../core"
# So from /app/user, ../core = /app/core
FROM node:20-alpine AS build-user

WORKDIR /app
COPY --from=build-core /app/core /app/core

WORKDIR /app/user
COPY user/package*.json ./
RUN npm install
COPY user/ ./
# Skip type check for production build (run in CI instead)
RUN npx vite build

# Build stage - Admin app
# admin/vue/package.json has: "@vbwd/view-component": "file:../../core"
# So from /app/admin/vue, ../../core = /app/core
FROM node:20-alpine AS build-admin

WORKDIR /app
COPY --from=build-core /app/core /app/core

WORKDIR /app/admin/vue
COPY admin/vue/package*.json ./
RUN npm install
COPY admin/vue/ ./
# Skip type check for production build (run in CI instead)
RUN npx vite build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build-user /app/user/dist /usr/share/nginx/html/user
COPY --from=build-admin /app/admin/vue/dist /usr/share/nginx/html/admin

# Copy nginx config
COPY container/frontend/nginx.conf /etc/nginx/nginx.conf

# Create log directory
RUN mkdir -p /var/log/nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
