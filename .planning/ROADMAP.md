# Roadmap: Extensible Checklist

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-01-27)
- 🚧 **v2.0 Production Ready** - Phases 5-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) - SHIPPED 2026-01-27</summary>

### Phase 1: Foundation
**Goal**: Project infrastructure and authentication system in place
**Plans**: 3 plans

Plans:
- [x] 01-01: Project setup, database, and initial scaffolding
- [x] 01-02: Authentication implementation (signup, login, logout)
- [x] 01-03: Auth UI and user session management

### Phase 2: Template Management
**Goal**: Users can create and manage reusable checklist templates
**Plans**: 3 plans

Plans:
- [x] 02-01: Template database schema and CRUD operations
- [x] 02-02: Template UI (create, edit, delete)
- [x] 02-03: Template item management (add, remove, reorder)

### Phase 3: Checklist Instantiation
**Goal**: Users can create working checklists from templates
**Plans**: 4 plans

Plans:
- [x] 03-01: Checklist database schema and template selection
- [x] 03-02: Multi-template merge logic with deduplication
- [x] 03-03: Checklist instantiation UI
- [x] 03-04: Template merge preview and refinement

### Phase 4: Checklist Workflow
**Goal**: Users can work through and manage active checklists
**Plans**: 3 plans

Plans:
- [x] 04-01: Check/uncheck items with progress tracking
- [x] 04-02: Checklist customization (add, remove, reorder items)
- [x] 04-03: Checklist list view and management

</details>

### 🚧 v2.0 Production Ready (In Progress)

**Milestone Goal:** Polish UX for power users and prepare for production deployment

#### Phase 5: Power User UX
**Goal**: Users can edit templates faster and print checklists
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, UX-07
**Success Criteria** (what must be TRUE):
  1. User can toggle to bulk text mode and paste multiple items at once when creating a template
  2. User can toggle to bulk text mode and edit all items as text when editing a template
  3. Each line in bulk text mode creates one item, empty lines are ignored
  4. User can print a checklist with browser print dialog, formatted for paper with minimal black & white styling
  5. Printed checklist preserves template grouping for easy reference
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Bulk text mode for templates
- [x] 05-02-PLAN.md — Print view for checklists
- [x] 05-03-PLAN.md — Verify power user UX features

#### Phase 6: Checklist Focus
**Goal**: Users can hide completed work to focus on remaining tasks
**Depends on**: Phase 5
**Requirements**: UX-08, UX-09, UX-10
**Success Criteria** (what must be TRUE):
  1. User can toggle hide/show completed items on any checklist
  2. When hiding completed, checked items disappear from view
  3. When hiding completed, template groups with all items checked are hidden
  4. Hide/show preference is remembered per-checklist across sessions
**Plans**: TBD

Plans:
- [ ] 06-01: TBD during phase planning

#### Phase 7: Production Deployment
**Goal**: Application runs in Docker and auto-deploys to Azure
**Depends on**: Phase 6
**Requirements**: DEV-01, DEV-02, DEV-03, DEV-04, DEV-05, DEV-06, DEV-07
**Success Criteria** (what must be TRUE):
  1. Application builds and runs in Docker container locally using Docker Compose
  2. Container includes health check endpoint that reports application status
  3. Pushing to main branch triggers GitHub Actions workflow
  4. Workflow builds Docker image, pushes to Azure Container Registry, and deploys to Azure App Service
  5. Prisma migrations run automatically during deployment without manual intervention
**Plans**: TBD

Plans:
- [ ] 07-01: TBD during phase planning

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-01-26 |
| 2. Template Management | v1.0 | 3/3 | Complete | 2026-01-26 |
| 3. Checklist Instantiation | v1.0 | 4/4 | Complete | 2026-01-27 |
| 4. Checklist Workflow | v1.0 | 3/3 | Complete | 2026-01-27 |
| 5. Power User UX | v2.0 | 3/3 | Complete | 2026-01-27 |
| 6. Checklist Focus | v2.0 | 0/TBD | Not started | - |
| 7. Production Deployment | v2.0 | 0/TBD | Not started | - |
