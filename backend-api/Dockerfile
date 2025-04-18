# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8001

# Expose port
EXPOSE 8001

# Start the application
CMD ["node", "index.js"]