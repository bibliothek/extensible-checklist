# Requirements: Extensible Checklist

**Defined:** 2026-01-27
**Core Value:** Fast, frictionless checklist instantiation - select templates, get a working checklist immediately, and start making progress.

## v2.0 Requirements

Requirements for v2.0 Production Ready milestone. Each maps to roadmap phases.

### UX Enhancements

- [ ] **UX-01**: User can toggle between individual item mode and bulk text mode when creating templates
- [ ] **UX-02**: User can toggle between individual item mode and bulk text mode when editing templates
- [ ] **UX-03**: In bulk text mode, each line creates one checklist item (auto-split on newlines)
- [ ] **UX-04**: In bulk text mode, empty lines are ignored
- [ ] **UX-05**: User can print a checklist with template grouping preserved
- [ ] **UX-06**: Print view uses minimal black & white styling suitable for paper
- [ ] **UX-07**: Print view is triggered via browser print (CSS @media print)
- [ ] **UX-08**: User can toggle hide/show completed items on a checklist
- [ ] **UX-09**: Hide completed preference is saved per-checklist
- [ ] **UX-10**: Template groups with all items checked are hidden when hide completed is enabled

### DevOps

- [ ] **DEV-01**: Application has a Dockerfile with multi-stage build using node:alpine
- [ ] **DEV-02**: Docker Compose file exists for local development (app + database)
- [ ] **DEV-03**: Container includes health check endpoint
- [ ] **DEV-04**: GitHub Actions workflow builds Docker image on push to main
- [ ] **DEV-05**: GitHub Actions workflow pushes image to Azure Container Registry
- [ ] **DEV-06**: GitHub Actions workflow deploys to Azure App Service
- [ ] **DEV-07**: Prisma migrations run automatically during deployment

## Future Requirements

Features deferred to later milestones.

(None yet - v2.0 focused on polish and deployment)

## Out of Scope

Explicitly excluded from this milestone. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Run tests in CI/CD | No test suite exists yet - focus on deployment infrastructure first |
| Manual approval gates | Auto-deploy on main for rapid iteration - can add approval later if needed |
| Multiple environments | Single production environment sufficient for v2.0 |
| Monitoring/observability | Basic health check adequate, comprehensive monitoring deferred |
| Database backup automation | Manual backups acceptable for v2.0 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UX-01 | TBD | Pending |
| UX-02 | TBD | Pending |
| UX-03 | TBD | Pending |
| UX-04 | TBD | Pending |
| UX-05 | TBD | Pending |
| UX-06 | TBD | Pending |
| UX-07 | TBD | Pending |
| UX-08 | TBD | Pending |
| UX-09 | TBD | Pending |
| UX-10 | TBD | Pending |
| DEV-01 | TBD | Pending |
| DEV-02 | TBD | Pending |
| DEV-03 | TBD | Pending |
| DEV-04 | TBD | Pending |
| DEV-05 | TBD | Pending |
| DEV-06 | TBD | Pending |
| DEV-07 | TBD | Pending |

**Coverage:**
- v2.0 requirements: 17 total
- Mapped to phases: 0
- Unmapped: 17 ⚠️

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after initial definition*
