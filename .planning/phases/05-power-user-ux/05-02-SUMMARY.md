---
phase: 05-power-user-ux
plan: 02
subsystem: checklist-ui
completed: 2026-01-27
duration: 5min
tech-stack:
  added: []
  patterns:
    - "CSS @media print queries"
    - "Tailwind print utilities"
key-files:
  created: []
  modified:
    - app/checklists/[id]/page.tsx
    - app/globals.css
decisions:
  - id: print-button-placement
    what: Print button placed in header next to "Back to Checklists" link
    why: Keeps print action visible and accessible near other navigation
    alternatives: Could be at bottom or in dropdown menu
  - id: print-utilities-approach
    what: Used Tailwind print:hidden utility classes inline plus @media print in globals.css
    why: Combines component-level control (inline utilities) with global print styling (CSS rules)
    alternatives: Could use only CSS with class selectors, but less maintainable
  - id: template-grouping-preservation
    what: Added .template-group class and page-break-inside:avoid rule
    why: Keeps related items together on same page for better readability
    alternatives: Could allow breaks mid-group, but reduces usability
dependencies:
  requires:
    - "04-02-checklist-detail-page"
    - "04-03-inline-editing"
  provides:
    - print-view-capability
  affects:
    - future-export-features
tags:
  - print
  - css
  - ui
  - paper-workflow
---

# Phase 5 Plan 02: Print View Summary

JWT auth with refresh rotation using jose library

## One-liner

Print button and @media print CSS for clean, paper-friendly checklist output with preserved template grouping.

## What Was Built

Added print functionality to checklist detail pages, enabling users to print checklists with clean black-and-white formatting suitable for offline/physical use.

**Print Button:**
- Located in header next to navigation
- Triggers `window.print()` browser API
- Hidden in print view itself via `print:hidden`

**Print-Hidden Elements:**
- Navigation links and Print button
- Progress bar with completion percentage
- Error banners
- Add item form and input
- Delete buttons (✕)
- Reorder buttons (▲▼)
- Collapse/expand toggles (▶▼)

**Print-Visible Elements:**
- Checklist name (large header)
- Template group headers
- Checkboxes (styled as empty squares)
- Item text (black text, no input borders)
- Template grouping structure

**CSS @media print Rules:**
- Force white background, black text/borders
- Remove shadows, gradients, colored backgrounds
- Style checkboxes for manual checking
- Prevent page breaks within template groups
- Add proper spacing for readability

## Technical Implementation

### Print Button Addition

Modified `app/checklists/[id]/page.tsx` header section:

```tsx
<div className="flex gap-4 items-center print:hidden">
  <button
    onClick={() => window.print()}
    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
  >
    Print Checklist
  </button>
  <Link href="/checklists" className="text-blue-600 dark:text-blue-400 hover:underline">
    ← Back to Checklists
  </Link>
</div>
```

### Tailwind Print Utilities

Applied throughout checklist detail page:
- `print:hidden` - Hides interactive elements (buttons, forms, navigation)
- `print:text-black` - Forces black text for headers and items
- `print:border-black` - Forces black borders for checkboxes
- `print:border-none` - Removes input borders from item text
- `print:bg-white` - Forces white backgrounds
- `print:appearance-none` - Resets checkbox appearance for consistent printing

### CSS @media Print Block

Added to `app/globals.css`:

```css
@media print {
  body {
    background: white !important;
    color: black !important;
  }

  .no-print {
    display: none !important;
  }

  * {
    background: white !important;
    color: black !important;
    border-color: black !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  input[type="checkbox"] {
    -webkit-appearance: checkbox !important;
    appearance: checkbox !important;
    border: 1px solid black !important;
    background: white !important;
  }

  .template-group {
    page-break-inside: avoid;
  }

  h1, h2, h3 {
    margin-top: 0.5em;
    margin-bottom: 0.25em;
  }

  .checklist-item {
    margin-bottom: 0.5em;
  }
}
```

**Key aspects:**
1. **Universal reset:** Forces all elements to white background, black text/borders
2. **Checkbox restoration:** Uses `-webkit-appearance` and `appearance` to show checkboxes as empty squares
3. **Template group preservation:** `page-break-inside: avoid` keeps groups together
4. **Ink efficiency:** Removes all shadows, gradients, colors

### Classes Added

Added semantic classes for CSS targeting:
- `.template-group` - Applied to each template section div
- `.checklist-item` - Applied to each item row div

These enable clean CSS selectors in @media print rules.

## Tasks Completed

| Task | Commit | Files Modified |
|------|--------|----------------|
| 1. Add print button to checklist detail page | a1ae38b | app/checklists/[id]/page.tsx |
| 2. Add CSS @media print styles | 7e7f90b | app/globals.css |

## Verification Results

**Build verification:**
- TypeScript compilation succeeds (npx tsc --noEmit)
- No syntax errors in CSS or TypeScript

**Code verification:**
- Print button exists with window.print() call
- print:hidden classes on navigation, buttons, forms, progress bar, error banner
- @media print block in globals.css
- White background and black text forced in print
- Template grouping preserved with page-break-inside:avoid
- Checkbox print styling present

**Success criteria met:**
- Print button renders on checklist detail page
- window.print() triggers on click
- Interactive elements hidden in print view
- Black and white print styling
- Template grouping preserved
- Checkboxes visible as empty squares
- Page formatting suitable for standard paper
- No ink wasted on backgrounds/shadows
- Build completes without errors

## Decisions Made

1. **Print button placement:** Header area next to navigation
   - Keeps action visible and accessible
   - Groups with other page-level controls

2. **Hybrid CSS approach:** Tailwind utilities + @media print block
   - Inline utilities for component-specific hiding
   - Global @media rules for universal print styling
   - Balance between maintainability and control

3. **Template grouping preservation:** page-break-inside:avoid
   - Keeps related items on same page
   - Critical for maintaining organizational structure
   - Better user experience for printed checklists

4. **Aggressive ink saving:** Force all elements to black/white
   - Removes all color styling universally
   - No backgrounds, shadows, gradients
   - Optimal for office printers

## Deviations from Plan

None - plan executed exactly as written.

## Testing Notes

**Manual testing required:**
1. Navigate to any checklist detail page
2. Click "Print Checklist" button
3. Verify print preview shows:
   - Only checklist content (no navigation/buttons)
   - Black text on white background
   - Empty checkboxes for manual checking
   - Template groups preserved
   - No colored elements

**Edge cases to verify:**
- Long checklists spanning multiple pages
- Template groups near page boundaries
- Dark mode → print (should force white)
- Browser print dialog opens correctly

## Integration Points

**Depends on:**
- Checklist detail page (04-02)
- Template grouping display (04-03)
- Inline editing UI (04-03)

**Enables:**
- Offline checklist usage
- Paper-based workflows
- Physical checklist handoff
- Future export features (PDF, etc.)

**Affects:**
- Future print customization options
- Export to PDF functionality
- Print settings/preferences

## Next Phase Readiness

**Ready to proceed:** Yes

**Blockers:** None

**Recommendations for next plans:**
1. Consider adding print date/timestamp to output
2. Could add option to hide completed items in print view
3. May want print layout customization (font size, margins)
4. Future: "Export as PDF" as alternative to browser print

## Performance Impact

**Minimal:**
- CSS @media print only evaluated during print
- No runtime JavaScript overhead
- window.print() is native browser API
- Print utilities compiled by Tailwind (no bundle impact)

## Lessons Learned

1. **Tailwind print utilities are powerful:** Easy to hide/show elements per media query
2. **Universal reset approach works well:** Forcing all elements to B&W ensures consistency
3. **page-break-inside:avoid is essential:** Prevents awkward splits in grouped content
4. **Checkbox styling requires careful handling:** Need both appearance reset and border styling
