#!/bin/sh

# Start Spring Boot application in background
java -jar /app/app.jar &

# Start Nginx web server in foreground
exec nginx -g 'daemon off;'
