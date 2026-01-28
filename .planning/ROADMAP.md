# Roadmap: Extensible Checklist

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-01-27)
- ✅ **v2.0 Production Ready** - Phases 5-7 (shipped 2026-01-27)
- ✅ **v2.1 Infrastructure Simplification** - Phases 8-10 (shipped 2026-01-28)
- ✅ **v2.2 UX & Access Control** - Phases 11-13 (shipped 2026-01-28)

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

<details>
<summary>✅ v2.1 Infrastructure Simplification (Phases 8-10) - SHIPPED 2026-01-28</summary>

- [x] Phase 8: Database Migration (1/1 plan) — completed 2026-01-27
- [x] Phase 9: Docker & Azure Update (2/2 plans) — completed 2026-01-28
- [x] Phase 10: Documentation & Verification (2/2 plans) — completed 2026-01-28

_See [milestones/v2.1-ROADMAP.md](.planning/milestones/v2.1-ROADMAP.md) for full details_

</details>

<details>
<summary>✅ v2.2 UX & Access Control (Phases 11-13) - SHIPPED 2026-01-28</summary>

- [x] Phase 11: Template Export (1/1 plan) — completed 2026-01-28
- [x] Phase 12: Navigation & Dashboard (2/2 plans) — completed 2026-01-28
- [x] Phase 13: Access Control (1/1 plan) — completed 2026-01-28

_See [milestones/v2.2-ROADMAP.md](.planning/milestones/v2.2-ROADMAP.md) for full details_

</details>

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
| 9. Docker & Azure Update | v2.1 | 2/2 | Complete | 2026-01-28 |
| 10. Documentation & Verification | v2.1 | 2/2 | Complete | 2026-01-28 |
| 11. Template Export | v2.2 | 1/1 | Complete | 2026-01-28 |
| 12. Navigation & Dashboard | v2.2 | 2/2 | Complete | 2026-01-28 |
| 13. Access Control | v2.2 | 1/1 | Complete | 2026-01-28 |

---
*Last updated: 2026-01-28 after v2.2 milestone completion*
