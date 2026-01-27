---
phase: 09-docker-azure-update
plan: 01
subsystem: infra
tags: [docker, sqlite, docker-compose, volume-mount, prisma-migrations]

# Dependency graph
requires:
  - phase: 08-database-migration
    provides: SQLite Prisma schema and migrations
  - phase: 07-production-deployment
    provides: Docker multi-stage build and migration entrypoint
provides:
  - SQLite-compatible Docker container with volume mount
  - Local development environment via docker-compose
  - Database persistence across container restarts
  - Simplified single-container deployment (no PostgreSQL service)
affects: [10-documentation-verification, azure-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SQLite file-based database in Docker via volume mount"
    - "Single-container deployment with embedded database"
    - "Full node_modules copy for Prisma CLI dependencies"

key-files:
  created:
    - docker-compose.yml (SQLite configuration)
  modified:
    - Dockerfile (SQLite support, data directory, full node_modules)
    - scripts/migrate-and-start.sh (node instead of npx)
    - README.md (Docker development section)
    - .gitignore (/data directory)
    - app/api/health/route.ts (import fix)

key-decisions:
  - "Copy full node_modules for Prisma CLI to avoid dependency resolution issues"
  - "Use ./data:/app/data volume mount for database persistence"
  - "Remove PostgreSQL service from docker-compose.yml for simplicity"

patterns-established:
  - "Direct node execution of Prisma CLI (node node_modules/prisma/build/index.js)"
  - "SQLite database file stored in mounted volume for persistence"

# Metrics
duration: 18min
completed: 2026-01-27
---

# Phase 09 Plan 01: Docker & Azure Update Summary

**SQLite-compatible Docker container with persistent volume mount and simplified single-container deployment**

## Performance

- **Duration:** 18 min
- **Started:** 2026-01-27T16:35:27Z
- **Completed:** 2026-01-27T16:53:27Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Docker container successfully runs with SQLite database file
- Database persists across container restarts via ./data volume mount
- Simplified docker-compose.yml configuration (no PostgreSQL service)
- Full test cycle completed: build → start → create data → restart → verify persistence

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Dockerfile for SQLite compatibility** - `5b10dd8` (feat)
2. **Task 2: Create docker-compose.yml for local development** - `fcc53fe` (feat)
3. **Task 3: Test Docker build and run with SQLite** - `cf8d6f5` (docs)

**Bug fixes during execution:** `8ed6071` (fix: Docker build and migration issues)

## Files Created/Modified
- `Dockerfile` - Added SQLite documentation, created /app/data directory, copied full node_modules for Prisma CLI
- `docker-compose.yml` - Replaced PostgreSQL service with SQLite volume mount configuration
- `scripts/migrate-and-start.sh` - Changed from npx to direct node execution of Prisma
- `.gitignore` - Added /data directory to exclude database files
- `app/api/health/route.ts` - Fixed import to use named export from lib/db
- `README.md` - Updated Docker Development section with SQLite instructions

## Decisions Made
- **Full node_modules copy:** Initially tried copying only @prisma, prisma, .prisma directories. This caused missing dependency errors (effect, fast-check, empathic). Decided to copy full node_modules to avoid dependency resolution issues in standalone build. Trade-off: slightly larger image size for guaranteed dependency resolution.
- **Direct node execution:** Changed migration script from `npx prisma` to `node node_modules/prisma/build/index.js` because npx isn't available in standalone Next.js build.
- **Port 3001 for testing:** Temporarily used port 3001 during testing because port 3000 was in use by local dev server. Restored to 3000 after testing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect import in health route**
- **Found during:** Task 3 (Docker build)
- **Issue:** Health route imported `prisma` as default export, but lib/db.ts exports `db` as named export. Build failed with "Export default doesn't exist in target module"
- **Fix:** Changed import from `import prisma from '@/lib/db'` to `import { db as prisma } from '@/lib/db'`
- **Files modified:** app/api/health/route.ts
- **Verification:** Docker build completed successfully
- **Committed in:** 8ed6071 (fix commit)

**2. [Rule 3 - Blocking] Fixed Prisma CLI execution in container**
- **Found during:** Task 3 (Container startup)
- **Issue:** Migration script used `npx prisma migrate deploy` but npx is not available in standalone Next.js build. Container crashed with "sh: prisma: not found"
- **Fix:** Changed to `node node_modules/prisma/build/index.js migrate deploy` for direct execution
- **Files modified:** scripts/migrate-and-start.sh
- **Verification:** Migrations ran successfully, database created
- **Committed in:** 8ed6071 (fix commit)

**3. [Rule 3 - Blocking] Resolved missing Prisma CLI dependencies**
- **Found during:** Task 3 (Container startup with fixed script)
- **Issue:** Dockerfile only copied specific Prisma directories (@prisma, prisma, .prisma) but not their dependencies. Container crashed with "Cannot find module 'effect'", then "fast-check", then "empathic/package"
- **Fix:** Changed Dockerfile to copy full node_modules from builder stage instead of selective directories
- **Files modified:** Dockerfile
- **Verification:** Container started successfully, migrations completed, health check passed
- **Committed in:** 8ed6071 (fix commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for container to build and run. The selective node_modules copy approach didn't work with Prisma CLI's deep dependency tree. Full node_modules copy is the reliable solution.

## Issues Encountered

**Prisma CLI dependency chain:** The standalone Next.js build doesn't include full node_modules. Initially tried selective copying of Prisma directories, but this created a cascade of missing dependencies (effect → fast-check → pure-rand → empathic). Resolution: copy full node_modules for Prisma CLI. This is acceptable because:
- Prisma migrations only run at container startup
- Image size increase is moderate (~200MB node_modules vs ~50MB selective)
- Eliminates dependency resolution issues completely
- Aligns with Docker best practice of "working is better than optimal"

## Testing Results

Verification workflow completed successfully:

1. **Clean state test:**
   - Deleted ./data directory
   - Built Docker image successfully
   - Started container
   - Migrations created new SQLite database at /app/data/dev.db
   - Container logs showed "1 migration found" and "All migrations have been successfully applied"

2. **Persistence test:**
   - Created test user via POST /api/auth/signup
   - User ID returned: cmkwu1h2a0000na012sksv67p
   - Database file exists on host: ./data/dev.db (100KB)
   - Stopped container with `docker-compose down`
   - Restarted container with `docker-compose up`
   - Logs showed "No pending migrations to apply" (detected existing database)
   - Database file size unchanged (100KB)
   - Health check passed: {"status":"healthy","database":"connected"}

3. **Documentation test:**
   - Followed README.md Docker Development section instructions
   - Commands worked as documented
   - Instructions accurate and complete

## User Setup Required

None - no external service configuration required. Docker and Docker Compose are the only prerequisites.

## Next Phase Readiness

Docker configuration is ready for Azure deployment update. Key points:
- SQLite database works in container with volume mount
- Migrations run automatically on startup
- Single-container deployment simplifies Azure App Service configuration
- No external database service required
- Volume mount pattern can be adapted to Azure Files for production persistence

**Next steps for Azure:**
- Update Azure deployment to use SQLite configuration
- Configure persistent storage for /app/data in Azure App Service
- Update GitHub Actions workflow to build with new Dockerfile
- Remove PostgreSQL-specific environment variables from Azure config

---
*Phase: 09-docker-azure-update*
*Completed: 2026-01-27*
