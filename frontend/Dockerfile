# Multi-stage production Dockerfile for Frontend (Vite + Nginx)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY frontend/package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build production bundle with relative API proxy path
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Serve static assets with Nginx
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
