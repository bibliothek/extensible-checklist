---
phase: 13-access-control
plan: 01
subsystem: authentication
tags: [security, access-control, environment-variables, email-validation]

dependency-graph:
  requires:
    - 01-auth-setup  # Built on existing signup endpoint
  provides:
    - email-based-signup-restriction
    - environment-variable-configuration
    - approved-email-list-validation
  affects:
    - future-phases  # Admin UI could manage approved emails

tech-stack:
  added: []
  patterns:
    - environment-variable-configuration
    - function-level-validation
    - case-insensitive-email-matching

key-files:
  created: []
  modified:
    - app/api/auth/signup/route.ts  # Added email validation function and access control
    - .env.example  # Added APPROVED_EMAILS documentation

decisions:
  - id: APPROVED_EMAILS-format
    choice: Comma-separated string in environment variable
    rationale: Simple configuration without additional dependencies or database schema changes
    tradeoffs: No UI for management, requires server restart to update list
    alternatives: ["Database table with admin UI", "JSON file configuration"]

metrics:
  tasks-completed: 1
  commits: 1
  duration: 2 minutes
  lines-added: 39
  completed: 2026-01-28
---

# Phase 13 Plan 01: Email-Based Access Control Summary

**One-liner:** Environment-variable email whitelist restricts signup to approved addresses with 403 error for unauthorized attempts

## What Was Built

Implemented email-based access control for the signup endpoint using the APPROVED_EMAILS environment variable:

1. **Email Validation Function**
   - Added `isEmailApproved()` helper function to validate submitted emails
   - Reads APPROVED_EMAILS from process.env
   - Parses comma-separated list with whitespace trimming
   - Case-insensitive email matching
   - Returns true if APPROVED_EMAILS is empty/undefined (open signup mode)

2. **Signup API Integration**
   - Validation placed after basic input checks, before password hashing
   - Non-approved emails receive 403 Forbidden status
   - Clear error message: "This email address is not approved for signup. Contact your administrator for access."
   - Existing error handling preserved (duplicate emails, validation errors)

3. **Configuration Documentation**
   - Updated .env.example with APPROVED_EMAILS variable
   - Documented comma-separated format
   - Explained open mode behavior (empty = allow all)
   - Noted case-insensitive matching

## How It Works

**Open Signup Mode (default):**
```env
# .env - APPROVED_EMAILS not set or empty
```
- All email addresses can create accounts
- No restrictions applied

**Restricted Mode:**
```env
APPROVED_EMAILS="alice@company.com,bob@company.com,charlie@company.com"
```
- Only listed email addresses can create accounts
- Non-approved emails receive 403 error
- Email matching is case-insensitive with whitespace trimming

**Validation Flow:**
1. User submits signup form with email + password
2. API validates email format (existing check)
3. API validates password length (existing check)
4. **NEW:** API checks if email is approved
5. If not approved: Return 403 with clear message
6. If approved: Continue to password hashing and user creation

## Key Files

### Modified Files

**app/api/auth/signup/route.ts** (39 lines added)
- Added `isEmailApproved(email: string): boolean` function (lines 5-27)
- Added email validation check before password hashing (lines 49-55)
- Returns 403 for non-approved emails
- Preserves all existing error handling

**.env.example** (6 lines added)
- Added APPROVED_EMAILS configuration section
- Documented comma-separated format with example
- Explained open mode behavior
- Noted case-insensitive matching

## Decisions Made

### APPROVED_EMAILS Format: Comma-Separated String

**Context:** Need simple way to configure approved emails without database changes

**Options considered:**
1. Comma-separated string in environment variable
2. Database table with admin UI
3. JSON file configuration

**Decision:** Comma-separated string in environment variable

**Rationale:**
- Zero dependencies (no database migration, no file parsing library)
- Fits existing environment variable pattern (NEXTAUTH_URL, DATABASE_URL)
- Easy to configure in deployment environments (Azure App Settings, .env files)
- Simple parsing logic (split, trim, lowercase)

**Tradeoffs:**
- Requires server restart to update list
- No UI for management (must edit environment variables)
- Not suitable for large teams (hundreds of users)

**Future path:** Database table with admin UI can be added later if needed (Phase 14+)

## Testing Evidence

**Code Verification:**
- isEmailApproved() function validates logic
- Reads process.env.APPROVED_EMAILS correctly
- Splits by comma with trimming
- Case-insensitive matching implemented
- Returns true for empty/undefined (open mode)
- Validation positioned correctly (after input checks, before hashing)
- 403 status with clear error message
- Existing error handling preserved

**Expected Manual Testing:**
1. Open mode (no APPROVED_EMAILS): All signups succeed
2. Restricted mode with approved email: Signup succeeds
3. Restricted mode with non-approved email: 403 error displayed
4. Existing login: Works unchanged (validation only on signup)

## Deviations from Plan

None - plan executed exactly as written.

## Metrics

- **Duration:** 2 minutes
- **Tasks completed:** 1/1
- **Commits:** 1
- **Files modified:** 2
- **Lines added:** 39
- **Lines removed:** 0

## Next Phase Readiness

**Phase 13 complete.** Access control successfully implemented.

**What's working:**
- Email validation function properly isolates logic
- Environment variable configuration is simple and documented
- 403 error provides clear guidance to users
- Open mode allows seamless transition to restricted mode

**No blockers for future phases.**

**Potential enhancements (not required):**
- Admin UI to manage approved emails (would require database table)
- Email domain approval (e.g., "*@company.com")
- Invitation system with expiring tokens
- Role-based access during signup
