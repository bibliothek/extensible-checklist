# Roadmap: Extensible Checklist

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-01-27)
- ✅ **v2.0 Production Ready** - Phases 5-7 (shipped 2026-01-27)
- 🚧 **v2.1 Infrastructure Simplification** - Phases 8-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) - SHIPPED 2026-01-27</summary>

### Phase 1: Foundation
**Goal**: Next.js application scaffold with database and authentication
**Plans**: 4 plans

Plans:
- [x] 01-01: Next.js setup with TypeScript and Tailwind
- [x] 01-02: PostgreSQL database with Prisma ORM
- [x] 01-03: Auth.js v5 authentication with email/password
- [x] 01-04: UI foundation with dark mode

### Phase 2: Templates
**Goal**: Users can create and manage reusable checklist templates
**Plans**: 3 plans

Plans:
- [x] 02-01: Template CRUD operations
- [x] 02-02: Template items with reordering
- [x] 02-03: Template library view

### Phase 3: Checklist Instantiation
**Goal**: Users can create checklists from multiple templates with intelligent merging
**Plans**: 3 plans

Plans:
- [x] 03-01: Multi-template selection interface
- [x] 03-02: Template merge logic with deduplication
- [x] 03-03: Checklist customization (add/remove/reorder)

### Phase 4: Active Checklists
**Goal**: Users can work through and manage active checklists
**Plans**: 3 plans

Plans:
- [x] 04-01: Checklist management (check/uncheck items)
- [x] 04-02: Progress tracking and indicators
- [x] 04-03: Checklist library view

</details>

<details>
<summary>✅ v2.0 Production Ready (Phases 5-7) - SHIPPED 2026-01-27</summary>

### Phase 5: Power User UX
**Goal**: Advanced editing and viewing capabilities for efficient workflows
**Plans**: 3 plans

Plans:
- [x] 05-01: Bulk text editing mode for templates
- [x] 05-02: Print view with ultra-minimal styling
- [x] 05-03: Hide completed items toggle

### Phase 6: Docker Foundation
**Goal**: Containerized application ready for deployment
**Plans**: 2 plans

Plans:
- [x] 06-01: Multi-stage Docker build with standalone Next.js
- [x] 06-02: Automated Prisma migrations at container startup

### Phase 7: Production Deployment
**Goal**: Complete CI/CD pipeline deploying to Azure
**Plans**: 3 plans

Plans:
- [x] 07-01: GitHub Actions workflow with Docker build and push
- [x] 07-02: Azure App Service configuration with PostgreSQL
- [x] 07-03: Complete deployment documentation

</details>

### 🚧 v2.1 Infrastructure Simplification (In Progress)

**Milestone Goal:** Simplify deployment by replacing PostgreSQL with SQLite and Azure Files persistence for reduced complexity and cost.

#### Phase 8: Database Migration
**Goal**: Application uses SQLite instead of PostgreSQL
**Depends on**: Nothing (first phase of milestone)
**Requirements**: DB-01, DB-02, DB-03
**Success Criteria** (what must be TRUE):
  1. Prisma schema uses SQLite provider instead of PostgreSQL
  2. Application connects to local SQLite file instead of PostgreSQL server
  3. All database operations work identically with SQLite backend
**Plans**: 1 plan

Plans:
- [x] 08-01: Migrate Prisma schema and configuration to SQLite

#### Phase 9: Docker & Azure Update
**Goal**: Containerized deployment uses SQLite with persistent Azure Files storage
**Depends on**: Phase 8
**Requirements**: DOCK-01, DOCK-02, DOCK-03, AZ-01, AZ-02, AZ-03, AZ-04
**Success Criteria** (what must be TRUE):
  1. Docker container runs with SQLite database persisted via volume mount
  2. Azure Files storage account configured and mounted to App Service
  3. GitHub Actions workflow deploys SQLite-based application to Azure
  4. Production deployment maintains data across container restarts
**Plans**: 2 plans

Plans:
- [ ] 09-01-PLAN.md — Docker SQLite support with volume mount configuration
- [ ] 09-02-PLAN.md — Azure deployment update with Files storage and documentation

#### Phase 10: Documentation & Verification
**Goal**: Complete deployment is documented and verified working end-to-end
**Depends on**: Phase 9
**Requirements**: DOC-01, DOC-02, DOC-03, VER-01, VER-02, VER-03
**Success Criteria** (what must be TRUE):
  1. Developer can follow README to set up local SQLite development environment
  2. Developer can follow deployment guide to configure Azure Files and deploy
  3. Complete user workflow (create account, templates, checklists) verified on production
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 4/4 | Complete | 2026-01-26 |
| 2. Templates | v1.0 | 3/3 | Complete | 2026-01-26 |
| 3. Checklist Instantiation | v1.0 | 3/3 | Complete | 2026-01-27 |
| 4. Active Checklists | v1.0 | 3/3 | Complete | 2026-01-27 |
| 5. Power User UX | v2.0 | 3/3 | Complete | 2026-01-27 |
| 6. Docker Foundation | v2.0 | 2/2 | Complete | 2026-01-27 |
| 7. Production Deployment | v2.0 | 3/3 | Complete | 2026-01-27 |
| 8. Database Migration | v2.1 | 1/1 | Complete | 2026-01-27 |
| 9. Docker & Azure Update | v2.1 | 0/2 | Ready to execute | - |
| 10. Documentation & Verification | v2.1 | 0/? | Not started | - |

---
*Last updated: 2026-01-27 after Phase 9 planning*
