# Extensible Checklist

## What This Is

A web application for managing personal recurring tasks through reusable checklist templates. Users create template building blocks and combine multiple templates to instantly generate customized checklists for their workflows.

## Core Value

Fast, frictionless checklist instantiation - select templates, get a working checklist immediately, and start making progress.

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] User can create an account and log in
- [ ] User can create, edit, and delete checklist templates
- [ ] User can instantiate a new checklist by selecting multiple templates
- [ ] Selected templates merge into a unified checklist
- [ ] User can customize the instantiated checklist (add, remove, reorder items)
- [ ] User can check off items as they complete them
- [ ] User can view their template library
- [ ] User can view their active checklists

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
| Templates merge (not link) | User wants unified checklist to work through, not jumping between multiple lists | - Pending |
| Customization after instantiation | Templates are starting points, not rigid contracts - flexibility is key to recurring task workflow | - Pending |
| No sharing in v1 | Personal tool focus simplifies auth, permissions, and UI complexity | - Pending |

---
*Last updated: 2026-01-26 after initialization*
