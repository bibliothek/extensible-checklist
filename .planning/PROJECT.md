# Extensible Checklist

## What This Is

A web application for managing personal recurring tasks through reusable checklist templates. Users create template building blocks and combine multiple templates to instantly generate customized checklists for their workflows.

## Core Value

Fast, frictionless checklist instantiation - select templates, get a working checklist immediately, and start making progress.

## Requirements

### Validated

- ✓ User can create an account and log in — v1.0
- ✓ User can create, edit, and delete checklist templates — v1.0
- ✓ User can instantiate a new checklist by selecting multiple templates — v1.0
- ✓ Selected templates merge into a unified checklist — v1.0 (with deduplication)
- ✓ User can customize the instantiated checklist (add, remove, reorder items) — v1.0
- ✓ User can check off items as they complete them — v1.0
- ✓ User can view their template library — v1.0
- ✓ User can view their active checklists — v1.0 (with progress indicators)

### Active

(To be defined for next milestone)

### Out of Scope

- Template organization (folders, tags, categories) - keep v1 simple, add structure later if needed
- Checklist history/analytics - focus on current workflow, not tracking past performance
- Template sharing between users - personal libraries only for v1
- Rich item features (notes, due dates, priorities, attachments) - plain checklist items are sufficient
- Mobile native apps - web-first, responsive design adequate
- Offline functionality - online-only acceptable for v1
- Real-time collaboration - single-user focused
- Template marketplace or discovery - users create their own

## Context

**Current State (v1.0 shipped):**
- Next.js 16 web application with ~3,181 lines TypeScript
- PostgreSQL database with Prisma ORM
- Auth.js v5 authentication with JWT sessions
- Complete template and checklist management
- Dark mode support, responsive design
- Running locally at http://localhost:3000

**Use Case:** Personal recurring tasks and routines that benefit from reusable structure but need flexibility. Examples include weekly planning, project kickoffs, travel preparation, or any process run repeatedly with minor variations.

**Key Insight:** Users don't want rigid templates - they want composable building blocks. The ability to merge multiple templates into one checklist enables mixing and matching process components based on specific needs.

**User Workflow:**
1. Build template library over time (onboarding checklist, code review steps, weekly review, etc.)
2. When starting a task, quickly select relevant templates
3. Get merged checklist with all items combined
4. Make minor adjustments for this specific instance
5. Work through checklist, checking off items

## Constraints

- **Multi-user:** Separate accounts and data isolation required - each user has private template library and checklists
- **Web-only:** Browser-based application, no mobile apps for v1
- **Tech stack:** Flexible - choose modern, productive stack for web apps

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Templates merge (not link) | User wants unified checklist to work through, not jumping between multiple lists | ✓ Good - users appreciate single unified view |
| Customization after instantiation | Templates are starting points, not rigid contracts - flexibility is key to recurring task workflow | ✓ Good - add/remove/reorder works well |
| No sharing in v1 | Personal tool focus simplifies auth, permissions, and UI complexity | ✓ Good - shipped faster without complexity |
| Next.js 16 with App Router | Modern React patterns, server components, built-in routing | ✓ Good - productive development |
| Auth.js v5 with JWT sessions | Stateless authentication, no session storage needed | ✓ Good - simple and scalable |
| Prisma ORM | Type-safe database queries, migrations, modern DX | ✓ Good - caught errors at compile time |
| Case-sensitive deduplication | Predictable behavior, simpler implementation | ✓ Good - works as expected |
| Optimistic UI updates | Instant feedback for all interactions | ✓ Good - feels responsive |
| Dark mode throughout | Modern UX expectation | ✓ Good - required bug fixes but worth it |

---
*Last updated: 2026-01-27 after v1.0 milestone completion*
