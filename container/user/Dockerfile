# Build stage - Core library
FROM node:20-alpine AS build-core

WORKDIR /app/core
COPY core/package*.json ./
RUN npm install
COPY core/ ./
RUN npm run build

# Build stage - User app
FROM node:20-alpine AS build-user

WORKDIR /app
COPY --from=build-core /app/core /app/core

WORKDIR /app/user
COPY user/package*.json ./
RUN npm install
COPY user/ ./
RUN npx vite build

# Build stage - Plugin API server
FROM node:20-alpine AS build-server

WORKDIR /app/server
COPY user/server/package*.json ./
RUN npm install
COPY user/server/ ./
RUN npx tsc

# Production stage
FROM node:20-alpine

RUN apk add --no-cache nginx
RUN mkdir -p /var/log/nginx /run/nginx

COPY --from=build-user /app/user/dist /usr/share/nginx/html
COPY --from=build-server /app/server/dist /app/server/dist
COPY --from=build-server /app/server/node_modules /app/server/node_modules
COPY --from=build-server /app/server/package.json /app/server/package.json

# Copy plugin data files
COPY user/plugins/ /app/plugins/

COPY container/user/nginx.conf /etc/nginx/nginx.conf
COPY container/user/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
