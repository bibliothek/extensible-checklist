# Roadmap: Extensible Checklist

## Overview

Build a web application for managing personal recurring tasks through reusable checklist templates. Starting with project foundation, we layer authentication, template creation and merging, then complete checklist workflow management. Each phase delivers working capabilities that build toward the core value of fast, frictionless checklist instantiation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffolding and development environment
- [x] **Phase 2: Authentication** - User accounts and session management
- [ ] **Phase 3: Template System** - Create templates and instantiate merged checklists
- [ ] **Phase 4: Checklist Workflow** - Complete active checklist management

## Phase Details

### Phase 1: Foundation
**Goal**: Working web application with database ready for feature development
**Depends on**: Nothing (first phase)
**Requirements**: None (foundation work)
**Success Criteria** (what must be TRUE):
  1. Web application runs locally with development server
  2. Database is configured and accepting connections
  3. Basic UI framework renders pages
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Set up Next.js, Prisma, and Tailwind foundation
- [x] 01-02-PLAN.md — Verify development environment works end-to-end

### Phase 2: Authentication
**Goal**: Users can securely access their accounts
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can create account with email and password
  2. User can log in and stay logged in across browser sessions
  3. User can log out from any page
  4. Each user's data is isolated from other users
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Authentication foundation with database schema and Auth.js configuration
- [x] 02-02-PLAN.md — Signup flow with email/password and duplicate email handling
- [x] 02-03-PLAN.md — Login and logout functionality with session management
- [x] 02-04-PLAN.md — Verify complete authentication system end-to-end

### Phase 3: Template System
**Goal**: Users can create reusable templates and instantiate merged checklists
**Depends on**: Phase 2
**Requirements**: TMPL-01, TMPL-02, TMPL-03, TMPL-04, INST-01, INST-02, INST-03
**Success Criteria** (what must be TRUE):
  1. User can create template with multiple checklist items
  2. User can edit existing template (add, remove, reorder items)
  3. User can delete template from library
  4. User can view all templates in their library
  5. User can select multiple templates and create merged checklist
  6. Merged checklist contains all items from selected templates
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — Database schema and template CRUD API foundation
- [ ] 03-02-PLAN.md — Template library UI with create, edit, and delete
- [ ] 03-03-PLAN.md — Checklist instantiation with merge logic and deduplication
- [ ] 03-04-PLAN.md — Verify complete template system end-to-end

### Phase 4: Checklist Workflow
**Goal**: Users can manage and complete active checklists
**Depends on**: Phase 3
**Requirements**: CHKL-01, CHKL-02, CHKL-03, CHKL-04, CHKL-05, CHKL-06, CHKL-07, CHKL-08
**Success Criteria** (what must be TRUE):
  1. User can view list of all active checklists
  2. User can open and work through a checklist
  3. User can check off items as they complete them
  4. User can uncheck items if needed
  5. User can customize active checklist (add, remove, reorder items)
  6. User can delete checklist when finished
**Plans**: TBD

Plans:
- [ ] TBD (will be defined during phase planning)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-26 |
| 2. Authentication | 4/4 | Complete | 2026-01-26 |
| 3. Template System | 0/4 | Not started | - |
| 4. Checklist Workflow | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-26*
*Last updated: 2026-01-26*
