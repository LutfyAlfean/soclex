# ============================================
# SOCLEX - Security Operations Center
# Docker Build Configuration
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

LABEL maintainer="SOCLEX Team <team@soclex.io>"
LABEL description="SOCLEX Security Operations Center"
LABEL version="1.0.0"

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create non-root user for security
RUN addgroup -g 1001 -S soclex && \
    adduser -S -D -H -u 1001 -h /usr/share/nginx/html -s /sbin/nologin -G soclex soclex && \
    chown -R soclex:soclex /usr/share/nginx/html && \
    chown -R soclex:soclex /var/cache/nginx && \
    chown -R soclex:soclex /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R soclex:soclex /var/run/nginx.pid

# Expose port 7129
EXPOSE 7129

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7129/ || exit 1

# Run as non-root user
USER soclex

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
