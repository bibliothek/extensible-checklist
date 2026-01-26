# Phase 3: Template System - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can create reusable checklist templates with multiple items, manage a personal template library, select one or more templates, and instantiate them into a merged working checklist. This phase delivers the core value: fast, frictionless checklist instantiation.

</domain>

<decisions>
## Implementation Decisions

### Template creation UX
- **Item entry:** Both Enter key AND "Add item" button work for flexibility
- **Creation flow:** Claude's discretion (single page vs modal)
- **Reordering mechanism:** Claude's discretion (drag handles vs arrow buttons)
- **Edit behavior:** Claude's discretion (in-place vs explicit edit mode)

### Template selection for merge
- **Selection order matters:** Items appear in checklist in the order templates were selected (first template's items, then second template's items, etc.)
- **Minimum templates:** At least 1 template required (single template instantiation is valid use case)
- **Selection UI:** Claude's discretion (checkboxes vs multi-select list)
- **Preview step:** Claude's discretion (show preview vs immediate creation)

### Merged checklist behavior
- **Template source visibility:** Show which template each item came from (template name or color indicator)
- **Visual structure:** Items grouped by template with template name headers
- **Duplicate handling:** Deduplicate automatically - if exact text match across templates, show item only once
- **Duplicate placement:** Deduplicated item appears under first selected template that contains it

### Claude's Discretion
- Template creation flow (single page vs modal dialog)
- Item reordering mechanism (drag-and-drop vs buttons)
- Template editing mode (in-place vs explicit edit)
- Selection UI pattern (checkboxes vs multi-select)
- Whether to show preview before creating merged checklist
- Exact visual styling of template source indicators
- Empty states and error handling

</decisions>

<specifics>
## Specific Ideas

- User wants flexibility for adding items: both keyboard-driven (Enter key) and mouse-driven ("Add item" button) should work
- Template selection order has semantic meaning: "select Morning Routine, then Work Setup" means morning items appear first in the checklist
- Deduplication prevents redundancy: if "Review email" is in multiple templates, showing it once reduces noise while maintaining grouped structure

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-template-system*
*Context gathered: 2026-01-26*
