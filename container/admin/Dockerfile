# Build stage - Core library
FROM node:20-alpine AS build-core

WORKDIR /app/core
COPY core/package*.json ./
RUN npm install
COPY core/ ./
RUN npm run build

# Build stage - Admin app
FROM node:20-alpine AS build-admin

ARG VITE_USER_APP_URL=http://localhost:8080
ARG VITE_PLUGIN_API_SECRET=default-dev-secret-at-least-32-characters-long

WORKDIR /app
COPY --from=build-core /app/core /app/core

WORKDIR /app/admin/vue
COPY admin/vue/package*.json ./
RUN npm install
COPY admin/vue/ ./
COPY admin/plugins/ /app/admin/plugins/
RUN VITE_USER_APP_URL=$VITE_USER_APP_URL VITE_PLUGIN_API_SECRET=$VITE_PLUGIN_API_SECRET npx vite build

# Production stage
FROM nginx:alpine

COPY --from=build-admin /app/admin/vue/dist /usr/share/nginx/html/admin
COPY container/admin/nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /var/log/nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
