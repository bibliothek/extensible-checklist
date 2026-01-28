# Requirements: Extensible Checklist

**Defined:** 2026-01-27
**Core Value:** Fast, frictionless checklist instantiation - select templates, get a working checklist immediately, and start making progress.

## v2.1 Requirements

Requirements for infrastructure simplification milestone.

### Database Migration

- [x] **DB-01**: Prisma schema updated to use SQLite provider
- [x] **DB-02**: Database connection configuration updated for SQLite file path
- [x] **DB-03**: Prisma migrations regenerated for SQLite compatibility

### Docker Configuration

- [x] **DOCK-01**: Dockerfile updated to support SQLite
- [x] **DOCK-02**: Docker volume mount configured for SQLite database file
- [x] **DOCK-03**: Container startup handles SQLite initialization

### Azure Deployment

- [x] **AZ-01**: Azure Files storage configured for SQLite persistence
- [x] **AZ-02**: App Service configured with Azure Files volume mount
- [x] **AZ-03**: GitHub Actions workflow updated for SQLite deployment
- [x] **AZ-04**: Environment variables updated for SQLite connection

### Documentation

- [ ] **DOC-01**: README updated with SQLite setup instructions
- [ ] **DOC-02**: Deployment guide updated for Azure Files configuration
- [ ] **DOC-03**: Local development instructions updated for SQLite

### Verification

- [ ] **VER-01**: Full user workflow tested locally with SQLite
- [ ] **VER-02**: Docker build and run verified with persistent SQLite
- [ ] **VER-03**: Production deployment tested on Azure with Azure Files

## Out of Scope

| Feature | Reason |
|---------|--------|
| PostgreSQL to SQLite data migration | Fresh start acceptable, no production data to migrate |
| Multi-instance deployment | Single instance model for SQLite simplicity |
| Database clustering/replication | Not needed for single-user workflows |
| Connection pooling | SQLite file-based, no connection pool needed |

## Traceability

Mapping requirements to phases.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 8 | Complete |
| DB-02 | Phase 8 | Complete |
| DB-03 | Phase 8 | Complete |
| DOCK-01 | Phase 9 | Complete |
| DOCK-02 | Phase 9 | Complete |
| DOCK-03 | Phase 9 | Complete |
| AZ-01 | Phase 9 | Complete |
| AZ-02 | Phase 9 | Complete |
| AZ-03 | Phase 9 | Complete |
| AZ-04 | Phase 9 | Complete |
| DOC-01 | Phase 10 | Pending |
| DOC-02 | Phase 10 | Pending |
| DOC-03 | Phase 10 | Pending |
| VER-01 | Phase 10 | Pending |
| VER-02 | Phase 10 | Pending |
| VER-03 | Phase 10 | Pending |

**Coverage:**
- v2.1 requirements: 16 total
- Mapped to phases: 16/16 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-28 after Phase 9 completion*
