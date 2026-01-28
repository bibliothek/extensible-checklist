# Roadmap: Extensible Checklist

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-01-27)
- ✅ **v2.0 Production Ready** - Phases 5-7 (shipped 2026-01-27)
- ✅ **v2.1 Infrastructure Simplification** - Phases 8-10 (shipped 2026-01-28)
- 🚧 **v2.2 UX & Access Control** - Phases 11-13 (in progress)

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

### 🚧 v2.2 UX & Access Control (In Progress)

**Milestone Goal:** Improve navigation and access control with dashboard, template export, and email-based access restrictions

- [x] **Phase 11: Template Export** - Users can backup templates to markdown files
- [ ] **Phase 12: Navigation & Dashboard** - Persistent nav bar and dashboard home page
- [ ] **Phase 13: Access Control** - Email-based signup restrictions

### Phase 11: Template Export
**Goal**: Users can export their template library to markdown files for backup
**Depends on**: Nothing (standalone feature)
**Requirements**: EXPORT-01, EXPORT-02, EXPORT-03, EXPORT-04
**Success Criteria** (what must be TRUE):
  1. User can trigger template export from templates library page
  2. Export downloads a markdown file with timestamp in filename
  3. Downloaded file contains all templates formatted as headings with checkbox items
  4. Template items appear in correct order matching the UI
**Plans**: 1 plan

Plans:
- [x] 11-01-PLAN.md — Export API endpoint and UI button for markdown download

### Phase 12: Navigation & Dashboard
**Goal**: Users have persistent navigation and a dashboard home page with recent activity
**Depends on**: Phase 11 (UI structure changes)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06
**Success Criteria** (what must be TRUE):
  1. User sees navigation bar at top of every authenticated page
  2. Navigation bar includes Templates and Checklists links with active state highlighting
  3. User lands on dashboard after login showing recent checklists
  4. Dashboard displays recent checklists with progress indicators
  5. Dashboard includes quick action buttons for Create Checklist and Create Template
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 13: Access Control
**Goal**: Signup is restricted to pre-approved email addresses with clear error messaging
**Depends on**: Phase 12 (completes UX before adding restrictions)
**Requirements**: ACCESS-01, ACCESS-02, ACCESS-03, ACCESS-04
**Success Criteria** (what must be TRUE):
  1. User signup validates email against approved list from environment variable
  2. Non-approved emails receive clear error message on signup attempt
  3. Approved users can create accounts and log in normally
  4. Email validation supports comma-separated format in environment variable
**Plans**: TBD

Plans:
- [ ] TBD

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
| 12. Navigation & Dashboard | v2.2 | 0/? | Not started | - |
| 13. Access Control | v2.2 | 0/? | Not started | - |

---
*Last updated: 2026-01-28 after v2.2 roadmap creation*
