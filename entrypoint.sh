#!/bin/sh

# Start Spring Boot application in background
java -jar /app/app.jar &
JAVA_PID=$!

# Start Nginx web server in background
nginx -g 'daemon off;' &
NGINX_PID=$!

# Trap signals for graceful shutdown
trap "kill -TERM $JAVA_PID $NGINX_PID 2>/dev/null" EXIT INT TERM

# Monitor background processes; exit container if either process fails
while kill -0 $JAVA_PID 2>/dev/null && kill -0 $NGINX_PID 2>/dev/null; do
    sleep 2
done

exit 1
