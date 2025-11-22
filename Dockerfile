# Production Dockerfile for Doctors-Linc
FROM node:18-bullseye-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libjpeg-dev \
    libpng-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies stage
FROM base AS dependencies

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Production stage
FROM base AS production

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN groupadd -r doctors-linc && useradd -r -g doctors-linc doctors-linc

# Copy dependencies and build artifacts
COPY --from=dependencies --chown=doctors-linc:doctors-linc /app/node_modules ./node_modules
COPY --from=build --chown=doctors-linc:doctors-linc /app/dist ./dist
COPY --chown=doctors-linc:doctors-linc package*.json ./

# Create necessary directories
RUN mkdir -p logs images output temp credentials && \
    chown -R doctors-linc:doctors-linc /app

USER doctors-linc

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/index.js"]
