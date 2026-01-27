# Phase 7: Production Deployment - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Docker containerization and automated Azure deployment pipeline. Application runs in Docker container with containerized PostgreSQL database, auto-deploys to Azure App Service on push to main via GitHub Actions. Prisma migrations run automatically during deployment.

</domain>

<decisions>
## Implementation Decisions

### Database management
- Prisma migrations run at container startup (before Next.js starts)
- Use container-based PostgreSQL database (not Azure managed service)
- Mount Azure volume for persistent storage across restarts
- Automatic schema creation on first deployment (migrations handle initialization)

### Deployment strategy
- Direct container swap deployment (brief downtime acceptable)
- Auto-deploy on every push to main branch (no manual approval gate)
- Health check endpoint returns 200 OK when app is running, checks database connectivity

### Environment configuration
- Production secrets stored in Azure App Service settings (not GitHub Secrets or Key Vault)
- Minimal environment variable set: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- DATABASE_URL uses Docker network hostname (service name from docker-compose)
- Document deployment configuration in README (not separate file)

### Claude's Discretion
- Deployment failure handling (rollback strategy)
- Docker multi-stage build optimization
- Health check implementation details
- Azure resource sizing and configuration

</decisions>

<specifics>
## Specific Ideas

No specific requirements — standard Docker + Azure deployment patterns apply.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-production-deployment*
*Context gathered: 2026-01-27*
