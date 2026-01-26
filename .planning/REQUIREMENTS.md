# Requirements: Extensible Checklist

**Defined:** 2026-01-26
**Core Value:** Fast, frictionless checklist instantiation - select templates, get a working checklist immediately, and start making progress.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can create account with email and password
- [x] **AUTH-02**: User can log in and stay logged in across sessions
- [x] **AUTH-03**: User can log out from any page

### Template Management

- [ ] **TMPL-01**: User can create new template with checklist items
- [ ] **TMPL-02**: User can edit existing template (add, remove, reorder items)
- [ ] **TMPL-03**: User can delete template from library
- [ ] **TMPL-04**: User can view template library (list of all templates)

### Checklist Instantiation

- [ ] **INST-01**: User can select multiple templates to combine
- [ ] **INST-02**: User can name the new checklist
- [ ] **INST-03**: User can create checklist from selected templates (merges all items)

### Checklist Management

- [ ] **CHKL-01**: User can view all active checklists
- [ ] **CHKL-02**: User can open a checklist to work on it
- [ ] **CHKL-03**: User can check off completed items
- [ ] **CHKL-04**: User can uncheck items if needed
- [ ] **CHKL-05**: User can add new items to active checklist
- [ ] **CHKL-06**: User can remove items from active checklist
- [ ] **CHKL-07**: User can reorder items in active checklist
- [ ] **CHKL-08**: User can delete checklist when done

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication

- **AUTH-04**: User can reset password via email link

### Checklist Instantiation

- **INST-04**: User can preview merged items before creating checklist

### Organization

- **ORG-01**: User can organize templates in folders or categories
- **ORG-02**: User can tag templates for easier discovery
- **ORG-03**: User can search templates by name or tag

### History

- **HIST-01**: User can view completed checklists history
- **HIST-02**: User can see how many times a template has been used
- **HIST-03**: User can archive completed checklists

### Sharing

- **SHARE-01**: User can export template to share with others
- **SHARE-02**: User can import template from file

### Rich Features

- **RICH-01**: User can add notes to checklist items
- **RICH-02**: User can set due dates on checklist items
- **RICH-03**: User can set priority on checklist items

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time collaboration | Single-user focused for v1, adds complexity |
| Mobile native apps | Web-first approach, responsive web adequate |
| Offline functionality | Online-only acceptable for v1 use case |
| Template marketplace | Personal tool, not community platform |
| Recurring/scheduled checklists | Manual instantiation sufficient for v1 |
| Sub-tasks or nested items | Flat checklist structure keeps v1 simple |
| Attachments or file uploads | Text-based items sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| TMPL-01 | Phase 3 | Pending |
| TMPL-02 | Phase 3 | Pending |
| TMPL-03 | Phase 3 | Pending |
| TMPL-04 | Phase 3 | Pending |
| INST-01 | Phase 3 | Pending |
| INST-02 | Phase 3 | Pending |
| INST-03 | Phase 3 | Pending |
| CHKL-01 | Phase 4 | Pending |
| CHKL-02 | Phase 4 | Pending |
| CHKL-03 | Phase 4 | Pending |
| CHKL-04 | Phase 4 | Pending |
| CHKL-05 | Phase 4 | Pending |
| CHKL-06 | Phase 4 | Pending |
| CHKL-07 | Phase 4 | Pending |
| CHKL-08 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-26 after roadmap creation*
