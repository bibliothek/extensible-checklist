---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/components/Navigation.tsx
  - app/dashboard/page.tsx
  - app/page.tsx
  - app/login/page.tsx
autonomous: true

must_haves:
  truths:
    - "Navigation buttons and logout button fit on mobile screens without overflow"
    - "Dashboard action buttons stack vertically on mobile"
    - "Page padding scales appropriately for mobile viewports"
    - "All UI elements are accessible and readable on mobile devices"
  artifacts:
    - path: "app/components/Navigation.tsx"
      provides: "Mobile-responsive navigation with proper spacing"
      min_lines: 60
    - path: "app/dashboard/page.tsx"
      provides: "Mobile-responsive dashboard layout"
      min_lines: 200
  key_links:
    - from: "Tailwind responsive classes"
      to: "Mobile viewport (< 768px)"
      via: "sm: and md: breakpoint prefixes"
      pattern: "(sm|md):"
---

<objective>
Fix mobile UI spacing and button placement issues to create a clean, polished mobile experience.

Purpose: Current UI has poor spacing on mobile viewports - fixed large padding (p-24), horizontal button overflow in navigation, and dashboard action buttons that don't stack properly. Mobile users experience cramped, awkward layouts.

Output: Mobile-responsive UI with proper spacing, stacked buttons, and clean layouts across all screen sizes.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@app/components/Navigation.tsx
@app/dashboard/page.tsx
@app/page.tsx
@app/login/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix Navigation mobile responsiveness</name>
  <files>app/components/Navigation.tsx</files>
  <action>
Update Navigation component for mobile screens:

1. **Logo text responsiveness**: Change "Extensible Checklist" to show abbreviated version on mobile
   - Add `<span className="hidden sm:inline">Extensible Checklist</span>`
   - Add `<span className="sm:hidden">EC</span>` for mobile

2. **Navigation layout**: Fix button overflow on mobile
   - Change nav flex container to wrap: `flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-4`
   - Update nav links padding: `px-3 py-2 sm:px-4` (smaller on mobile)
   - Reduce font size on mobile: `text-xs sm:text-sm`

3. **Logout button**: Make it compact on mobile
   - Update LogoutButton padding: `px-4 py-2 sm:px-6` (smaller on mobile)
   - Add text-xs on mobile: `text-xs sm:text-sm`

4. **Header spacing**: Reduce space-x between nav and logout
   - Change `space-x-4` to `space-x-2 sm:space-x-4`

Why these changes: Navigation currently overflows horizontally on narrow screens. Abbreviated logo, smaller padding, and wrapping prevent overflow while maintaining usability.
  </action>
  <verify>
1. Run dev server: `npm run dev`
2. Open browser DevTools, toggle device emulation (iPhone SE, 375px width)
3. Navigate to /dashboard
4. Verify: Logo shows "EC", nav buttons visible without horizontal scroll, logout button fits
5. Resize to tablet (768px): Full logo "Extensible Checklist" appears, larger button padding
  </verify>
  <done>Navigation renders cleanly on mobile (375px) with no overflow, abbreviated logo on small screens, full logo on larger screens, all buttons accessible</done>
</task>

<task type="auto">
  <name>Task 2: Fix Dashboard and page padding for mobile</name>
  <files>app/dashboard/page.tsx, app/page.tsx, app/login/page.tsx</files>
  <action>
Update page-level padding and button layouts for mobile screens:

**Dashboard (app/dashboard/page.tsx):**

1. **Main container padding**: Line 103, change `p-8 md:p-24` to `p-4 sm:p-6 md:p-12 lg:p-24`
   - 16px on mobile (p-4)
   - 24px on small screens (sm:p-6)
   - 48px on medium (md:p-12)
   - 96px on large (lg:p-24)

2. **Header action buttons**: Lines 110-123, stack vertically on mobile
   - Wrap buttons in div: `<div className="flex flex-col sm:flex-row gap-3">`
   - Update button classes to `w-full sm:w-auto` (full width on mobile, auto on desktop)
   - Reduce padding on mobile: `px-4 py-2 sm:px-6 sm:py-3`
   - Smaller text on mobile: `text-sm sm:text-base`

3. **Header title**: Line 107, reduce text size on mobile
   - Change `text-4xl` to `text-2xl sm:text-3xl md:text-4xl`

**Home page (app/page.tsx):**

1. **Main container padding**: Line 29, change `p-24` to `p-6 sm:p-12 md:p-24`

2. **Hero title**: Line 30, reduce on mobile
   - Change `text-4xl` to `text-3xl sm:text-4xl`

3. **Hero text**: Line 31, adjust spacing
   - Change `mt-4 text-lg` to `mt-3 text-base sm:text-lg`

4. **Action buttons**: Line 35, stack on mobile
   - Change `flex gap-4` to `flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto`
   - Add `w-full sm:w-auto` to both Link components
   - Update button padding: `px-4 py-2 sm:px-6 sm:py-3`

**Login page (app/login/page.tsx):**

1. **Main container padding**: Line 44, change `p-24` to `p-6 sm:p-12 md:p-24`

Why these changes: Fixed p-24 (96px) padding is excessive on mobile, leaving minimal space for content. Graduated padding (p-4 → p-6 → p-12 → p-24) provides appropriate spacing at each breakpoint. Stacked buttons on mobile prevent horizontal overflow.
  </action>
  <verify>
1. Test mobile (375px width) in DevTools:
   - Visit /dashboard: 16px padding, title readable, action buttons stacked vertically
   - Visit / (home): 24px padding, hero text readable, auth buttons stacked
   - Visit /login: 24px padding, form centered with breathing room

2. Test tablet (768px width):
   - All pages: Larger padding, buttons horizontal, text size increases

3. Test desktop (1024px+):
   - Dashboard: Full p-24 padding restored, horizontal buttons
   - Home and login: Full p-24 padding
  </verify>
  <done>All pages render with appropriate padding for viewport size, buttons stack on mobile without overflow, text scales for readability, UI looks polished on 375px, 768px, and 1024px+ screens</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Mobile-responsive UI with proper spacing and button layouts across Navigation, Dashboard, Home, and Login pages</what-built>
  <how-to-verify>
1. Start dev server: `npm run dev`
2. Open http://localhost:3000 in Chrome/Firefox
3. Open DevTools (F12), toggle device toolbar (Ctrl+Shift+M)

**Test mobile (iPhone SE - 375px):**
- Home: Logo, buttons stacked, adequate padding
- Login: Form not cramped, adequate padding
- Dashboard (after login): "EC" logo, nav buttons fit, action buttons stacked, cards readable

**Test tablet (iPad - 768px):**
- All pages: Full logo, horizontal buttons, larger padding

**Test desktop (1920px):**
- All pages: Spacious layout, horizontal buttons, generous padding

**Expected:**
- No horizontal scrollbars on any viewport
- All buttons accessible without overflow
- Text readable at all sizes
- Clean, polished appearance
  </how-to-verify>
  <resume-signal>Type "approved" if mobile UI looks clean and polished, or describe any remaining issues</resume-signal>
</task>

</tasks>

<verification>
1. No horizontal scroll on mobile viewports (375px, 414px)
2. Navigation buttons visible and accessible on all screen sizes
3. Dashboard action buttons stack vertically on mobile
4. Page padding scales appropriately (p-4 on mobile → p-24 on desktop)
5. All text readable without zooming on mobile
6. Button interactions work on touch devices
</verification>

<success_criteria>
1. Mobile viewport (375px): UI renders cleanly with no overflow, buttons stacked, adequate spacing
2. Tablet viewport (768px): Buttons horizontal, medium spacing, full logo visible
3. Desktop viewport (1024px+): Full spacing restored, all elements spacious
4. User can navigate entire app on mobile without horizontal scrolling
5. All interactive elements accessible on touch screens
</success_criteria>

<output>
After completion, create `.planning/quick/001-fix-mobile-ui-spacing-and-button-placeme/001-SUMMARY.md`
</output>
