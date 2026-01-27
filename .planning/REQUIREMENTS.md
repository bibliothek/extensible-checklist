# Requirements: Extensible Checklist

**Defined:** 2026-01-27
**Core Value:** Fast, frictionless checklist instantiation - select templates, get a working checklist immediately, and start making progress.

## v2.1 Requirements

Requirements for infrastructure simplification milestone.

### Database Migration

- [ ] **DB-01**: Prisma schema updated to use SQLite provider
- [ ] **DB-02**: Database connection configuration updated for SQLite file path
- [ ] **DB-03**: Prisma migrations regenerated for SQLite compatibility

### Docker Configuration

- [ ] **DOCK-01**: Dockerfile updated to support SQLite
- [ ] **DOCK-02**: Docker volume mount configured for SQLite database file
- [ ] **DOCK-03**: Container startup handles SQLite initialization

### Azure Deployment

- [ ] **AZ-01**: Azure Files storage configured for SQLite persistence
- [ ] **AZ-02**: App Service configured with Azure Files volume mount
- [ ] **AZ-03**: GitHub Actions workflow updated for SQLite deployment
- [ ] **AZ-04**: Environment variables updated for SQLite connection

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

Mapping requirements to phases. Will be populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | TBD | Pending |
| DB-02 | TBD | Pending |
| DB-03 | TBD | Pending |
| DOCK-01 | TBD | Pending |
| DOCK-02 | TBD | Pending |
| DOCK-03 | TBD | Pending |
| AZ-01 | TBD | Pending |
| AZ-02 | TBD | Pending |
| AZ-03 | TBD | Pending |
| AZ-04 | TBD | Pending |
| DOC-01 | TBD | Pending |
| DOC-02 | TBD | Pending |
| DOC-03 | TBD | Pending |
| VER-01 | TBD | Pending |
| VER-02 | TBD | Pending |
| VER-03 | TBD | Pending |

**Coverage:**
- v2.1 requirements: 16 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 16 ⚠️

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after initial definition*
