# Stage 1: Build Frontend (React 19 + Vite)
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend (Spring Boot 3 + Java 21)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 3: Unified Production Runtime (Java 21 JRE + Nginx)
FROM eclipse-temurin:21-jre-alpine

# Install Nginx web server
RUN apk add --no-cache nginx && mkdir -p /run/nginx

# Copy Nginx Reverse Proxy Configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy Frontend static build artifacts
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy Spring Boot Executable JAR
COPY --from=backend-builder /app/target/pulseflow-enterprise-api-1.0.0-SNAPSHOT.jar /app/app.jar

# Copy Entrypoint Startup Script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000 8080

ENTRYPOINT ["/entrypoint.sh"]
