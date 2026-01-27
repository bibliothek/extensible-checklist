# Multi-stage Dockerfile for Next.js 16 with Prisma
# Based on Next.js official Docker example
#
# DATABASE CONFIGURATION:
# This Dockerfile supports SQLite database via file-based storage.
# Set DATABASE_URL environment variable at runtime with format:
#   DATABASE_URL=file:/app/data/dev.db
# Mount a volume at /app/data to persist database across container restarts.

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
# This creates .next/standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner (production image)
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl bash wget

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy Prisma schema and migrations for runtime migration
COPY --chown=nextjs:nodejs prisma ./prisma

# Copy Next.js standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy migration entrypoint script
COPY --chown=nextjs:nodejs scripts/migrate-and-start.sh ./scripts/migrate-and-start.sh
RUN chmod +x ./scripts/migrate-and-start.sh

# Copy node_modules with Prisma CLI for migrations
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Create data directory for SQLite database with proper permissions
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Switch to non-root user
USER nextjs

# Expose Next.js port
EXPOSE 3000

# Set hostname to allow connections
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Run migrations then start Next.js
ENTRYPOINT ["./scripts/migrate-and-start.sh"]
