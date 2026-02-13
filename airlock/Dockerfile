# SERIES A STANDARD CONTAINER
# Minimized for Cloud Run Cold Starts

# 1. Build Stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 2. Production Stage (Distroless for security)
FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Performance Tuning
ENV NODE_ENV=production
# Google Cloud Run injects PORT, usually 8080
CMD ["index.js"]