#!/bin/bash
# Migration entrypoint script for Docker container
# Runs Prisma migrations before starting Next.js server

set -e  # Exit immediately if any command fails

echo "================================"
echo "Starting migration entrypoint..."
echo "================================"

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  echo "Cannot run migrations without database connection"
  exit 1
fi

echo "DATABASE_URL is configured"

# Run Prisma migrations
echo "Running Prisma migrations..."
node node_modules/prisma/build/index.js migrate deploy

# Check migration exit code
if [ $? -ne 0 ]; then
  echo "ERROR: Prisma migrations failed"
  echo "Cannot start application with outdated database schema"
  exit 1
fi

echo "Migrations completed successfully"

# Start Next.js server
echo "Starting Next.js server..."
exec node server.js
