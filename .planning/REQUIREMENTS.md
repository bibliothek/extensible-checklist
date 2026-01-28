# Requirements: Extensible Checklist

**Defined:** 2026-01-28
**Core Value:** Fast, frictionless checklist instantiation - select templates, get a working checklist immediately, and start making progress.

## v2.2 Requirements

Requirements for v2.2 UX & Access Control milestone.

### Export

- [x] **EXPORT-01**: User can trigger template export from templates library page
- [x] **EXPORT-02**: Export downloads markdown file with timestamp
- [x] **EXPORT-03**: Exported file contains all templates as headings with checkbox items
- [x] **EXPORT-04**: Template items preserve order in exported markdown

### Navigation

- [x] **NAV-01**: User sees persistent navigation bar on all authenticated pages
- [x] **NAV-02**: Navigation bar includes Templates and Checklists links
- [x] **NAV-03**: Dashboard replaces landing page as home after login
- [x] **NAV-04**: Dashboard displays recent checklists with progress indicators
- [x] **NAV-05**: Dashboard includes quick action buttons for Create Checklist and Create Template
- [x] **NAV-06**: Navigation bar shows current section as active/highlighted

### Access Control

- [ ] **ACCESS-01**: Signup validates email against approved list from environment variable
- [ ] **ACCESS-02**: Non-approved emails receive error message on signup attempt
- [ ] **ACCESS-03**: Approved email list supports comma-separated format
- [ ] **ACCESS-04**: Existing login functionality works unchanged for approved users

## Out of Scope

Features explicitly excluded from this milestone:

| Feature | Reason |
|---------|--------|
| Admin UI for email management | Environment variable approach is simpler for small groups |
| Template import from markdown | Export is one-way backup, not round-trip |
| Checklist export | Templates are the reusable assets worth backing up |
| Advanced dashboard analytics | Focus on recent items and quick actions, not comprehensive stats |
| Sidebar navigation | Top navigation bar is simpler and works well on mobile |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EXPORT-01 | Phase 11 | Complete |
| EXPORT-02 | Phase 11 | Complete |
| EXPORT-03 | Phase 11 | Complete |
| EXPORT-04 | Phase 11 | Complete |
| NAV-01 | Phase 12 | Complete |
| NAV-02 | Phase 12 | Complete |
| NAV-03 | Phase 12 | Complete |
| NAV-04 | Phase 12 | Complete |
| NAV-05 | Phase 12 | Complete |
| NAV-06 | Phase 12 | Complete |
| ACCESS-01 | Phase 13 | Complete |
| ACCESS-02 | Phase 13 | Complete |
| ACCESS-03 | Phase 13 | Complete |
| ACCESS-04 | Phase 13 | Complete |

**Coverage:**
- v2.2 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after Phase 13 completion*
