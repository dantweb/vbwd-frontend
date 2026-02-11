#!/bin/sh
# Start Node.js plugin API in background
cd /app/server && node dist/index.js &

# Start nginx in foreground
nginx -g 'daemon off;'
