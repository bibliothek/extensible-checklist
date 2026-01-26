# Phase 2: Authentication - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable users to create accounts with email and password, log in securely, maintain sessions across browser sessions, and log out. Each user's data must be isolated from other users.

</domain>

<decisions>
## Implementation Decisions

### Sign-up flow
- Just email and password fields (no additional info collected)
- Password minimum length: 8 characters (no complexity requirements)
- Show clear error if email already exists ("Email already registered" + suggest login)
- No terms of service or privacy policy acceptance in v1

### Login experience
- Separate pages: /login and /signup (not tabbed interface)
- No "Remember me" checkbox - always use long sessions by default
- Simple error message for failed login ("Invalid email or password")
- No rate limiting or account lockout on failed attempts

### Session behavior
- Long-lived sessions: 30 days
- Multiple devices allowed - unlimited concurrent sessions
- Sliding window: activity extends session by another 30 days
- Sessions persist across browser closes

### Claude's Discretion
- Email verification approach (verify vs instant access)
- Forgot password flow inclusion in v1
- Post-login destination (home/dashboard vs last location)
- Logout UI placement (user menu vs visible button)
- Unauthenticated visitor experience (landing page vs straight to login)
- Post-logout destination (login page vs landing page)
- Session expiration UX (immediate redirect vs message first)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decided constraints.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-authentication*
*Context gathered: 2026-01-26*
