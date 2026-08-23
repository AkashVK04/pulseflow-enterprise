#!/bin/sh

set -e

echo "Starting Spring Boot on port 8080..."

java -jar /app/app.jar &
JAVA_PID=$!

echo "Starting Nginx on port 10000..."

nginx -g 'daemon off;' &
NGINX_PID=$!

trap 'kill -TERM $JAVA_PID $NGINX_PID 2>/dev/null || true' EXIT INT TERM

while kill -0 $JAVA_PID 2>/dev/null && kill -0 $NGINX_PID 2>/dev/null; do
    sleep 2
done

exit 1