---
phase: "03-template-system"
plan: "02"
subsystem: "ui-layer"
tags: ["react", "nextjs", "ui", "forms", "crud"]

requires:
  - phase: "03-template-system"
    plan: "03-01"
    provides: ["template-crud-api", "template-item-management"]
  - phase: "02-authentication"
    provides: ["auth-session", "useSession-hook"]

provides:
  - "template-library-ui"
  - "template-creation-flow"
  - "template-editing-flow"
  - "reusable-template-form"
  - "keyboard-accessible-item-entry"

affects:
  - phase: "03-template-system"
    plan: "03-03"
    reason: "Next plan will consume template library for instantiation"

tech-stack:
  added:
    - name: "TemplateForm component"
      type: "react-component"
      purpose: "Reusable form for template create and edit"
  patterns:
    - "Client component with useSession authentication"
    - "Optimistic UI updates on delete"
    - "Keyboard + mouse interaction support (Enter key + button)"
    - "Up/down arrow buttons for item reordering"
    - "Auto-renumbering on item add/remove/reorder"

key-files:
  created:
    - path: "app/templates/page.tsx"
      exports: ["default TemplatesPage"]
      purpose: "Template library list view with create/edit/delete"
      lines: 176
    - path: "app/components/TemplateForm.tsx"
      exports: ["default TemplateForm"]
      purpose: "Reusable form component for create/edit"
      lines: 255
    - path: "app/templates/new/page.tsx"
      exports: ["default NewTemplatePage"]
      purpose: "Create new template page"
      lines: 57
    - path: "app/templates/[id]/edit/page.tsx"
      exports: ["default EditTemplatePage"]
      purpose: "Edit existing template page"
      lines: 130

decisions:
  - id: "reorder-mechanism"
    question: "Drag-and-drop or arrow buttons for reordering?"
    chosen: "Up/down arrow buttons"
    rationale: "Simpler implementation, no external library needed, accessible, works on all devices"
  - id: "form-location"
    question: "Separate pages vs modal for create/edit?"
    chosen: "Separate pages at /templates/new and /templates/[id]/edit"
    rationale: "More screen real estate for form, clearer navigation, better for SEO/bookmarking"
  - id: "delete-confirmation"
    question: "How to confirm delete operations?"
    chosen: "Browser confirm() dialog"
    rationale: "Quick to implement, familiar UX, sufficient for v1"
  - id: "inline-item-editing"
    question: "Should existing items be editable inline?"
    chosen: "Yes - items are text inputs"
    rationale: "Flexible UX, allows typo fixes without deleting and re-adding"

metrics:
  duration: "66min"
  tasks: 2
  commits: 2
  files_created: 4
  files_modified: 0
  completed: "2026-01-26"
---

# Phase 03 Plan 02: Template Library UI Summary

**One-liner:** Responsive template library with full CRUD via reusable form component supporting keyboard (Enter) and mouse (button) item entry plus arrow-button reordering

## What Was Built

### Template Library Page (Task 1)
**app/templates/page.tsx (176 lines):**
- Client component using useSession for authentication
- Fetches all user templates from GET /api/templates on mount
- Responsive grid layout: 1 column mobile, 2 tablet, 3 desktop
- Each template card displays:
  - Template name (h3 heading)
  - Item count ("X items")
  - Created date (formatted locale date)
  - Edit button (links to /templates/[id]/edit)
  - Delete button (browser confirm, DELETE to API)
- "Create New Template" button in header
- Empty state with call-to-action when no templates
- Optimistic UI: removes deleted template from list immediately
- Back to Home link
- Error handling with visible error messages
- Loading state while fetching

**Authentication:**
- Redirects to /login if unauthenticated
- Uses useSession hook from next-auth/react
- Checks session status on mount

**Styling:**
- Tailwind CSS following established patterns
- Hover effects on cards (border + shadow)
- Responsive padding and layout
- Color scheme matches login/signup pages

### Template Form Component (Task 2)
**app/components/TemplateForm.tsx (255 lines):**

**Props interface:**
- `initialData` (optional): { name, items } for edit mode
- `onSubmit`: async callback receives { name, items }
- `onCancel`: callback for cancel button

**State management:**
- Template name (string)
- Items array (id, text, order)
- New item input text
- Loading and error states

**Item entry (keyboard accessibility requirement):**
- Text input for new items
- **Enter key** adds item to list
- **"Add Item" button** also adds item
- Both methods work identically
- Input clears after adding
- Visual hint: "Press Enter or click 'Add Item'"

**Item management:**
- Each item displays as input field (inline editing)
- Up/down arrow buttons for reordering
- X button to remove item
- Auto-renumbering when items added/removed/reordered
- First item's up button disabled
- Last item's down button disabled

**Validation:**
- Name required (client-side validation)
- At least 1 item required
- Trimmed whitespace from name and items
- Error display above form

**Loading state:**
- Disables all inputs and buttons during submission
- Shows "Saving..." on submit button

### Create Template Page
**app/templates/new/page.tsx (57 lines):**
- Protected route (redirects if unauthenticated)
- Renders TemplateForm with no initialData
- onSubmit: POST to /api/templates
- On success: redirects to /templates
- On error: TemplateForm displays error
- Loading spinner while checking auth

### Edit Template Page
**app/templates/[id]/edit/page.tsx (130 lines):**
- Protected route (redirects if unauthenticated)
- Fetches template data from GET /api/templates/[id]
- Renders TemplateForm with initialData
- onSubmit: PUT to /api/templates/[id]
- On success: redirects to /templates
- Error handling:
  - 404: "Template not found" message
  - Other errors: error display with back button
- Loading spinner while fetching

## Technical Implementation

### Navigation Flow
```
/templates (library)
  ├─> /templates/new (create)
  └─> /templates/[id]/edit (edit)
       └─> Back to /templates after save/cancel
```

### Data Flow - Create
1. User navigates to /templates/new
2. Fills name and adds items (Enter or button)
3. Reorders items with arrow buttons
4. Clicks "Save Template"
5. POST to /api/templates with { name, items: [{text, order}] }
6. On success: router.push("/templates")
7. Library page fetches and displays new template

### Data Flow - Edit
1. User clicks "Edit" on template card
2. Navigate to /templates/[id]/edit
3. Page fetches GET /api/templates/[id]
4. TemplateForm pre-populated with existing data
5. User modifies name/items/order
6. Clicks "Save Template"
7. PUT to /api/templates/[id] with updated data
8. On success: router.push("/templates")
9. Library page shows updated template

### Data Flow - Delete
1. User clicks "Delete" on template card
2. Browser confirm dialog: "Are you sure...?"
3. If confirmed: DELETE to /api/templates/[id]
4. On success: optimistically remove from UI
5. No page refresh needed

### Item Reordering Implementation
- Items stored with order field (0-indexed)
- Up button: swap with previous item, renumber all
- Down button: swap with next item, renumber all
- Renumbering ensures sequential 0, 1, 2, 3...
- Order field sent to API on save

### Authentication Pattern
All pages use same pattern:
```typescript
const { status } = useSession();

useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/login");
  }
}, [status, router]);
```

## Deviations from Plan

None - plan executed exactly as written.

## Testing Performed

### Template Library Page
✓ Page loads for authenticated users
✓ Redirects to /login for unauthenticated users
✓ Empty state displays when no templates
✓ Template cards display name, count, date
✓ Create button links to /templates/new
✓ Edit button links to /templates/[id]/edit
✓ Delete button shows confirmation dialog
✓ Grid layout responsive (1/2/3 columns)
✓ Hover effects work on cards
✓ Back to home link works

### Template Form Component
✓ Name input works
✓ Add item via Enter key works
✓ Add item via button works
✓ Empty item text ignored (trim check)
✓ Items display in order
✓ Up arrow moves item up
✓ Down arrow moves item down
✓ First item up button disabled
✓ Last item down button disabled
✓ Remove button deletes item
✓ Order auto-renumbers after changes
✓ Inline editing of item text works
✓ Validation: name required error shows
✓ Validation: at least 1 item required
✓ Save button shows loading state
✓ Cancel button works
✓ All inputs disabled during submission

### Create Template Flow
✓ Page loads for authenticated users
✓ Form starts empty
✓ Can add multiple items
✓ Can reorder before saving
✓ Save creates template via POST
✓ Redirects to /templates on success
✓ Error displays if API fails

### Edit Template Flow
✓ Page loads template data
✓ Form pre-populated with name and items
✓ Can modify name
✓ Can add new items
✓ Can remove existing items
✓ Can reorder items
✓ Can edit item text inline
✓ Save updates template via PUT
✓ Redirects to /templates on success
✓ 404 handled gracefully
✓ Error displays if API fails

### Keyboard Accessibility
✓ Enter key adds item (requirement from CONTEXT.md)
✓ Button also adds item (requirement from CONTEXT.md)
✓ Tab navigation works through all inputs
✓ Focus states visible on inputs and buttons
✓ Keyboard-only navigation functional

## Known Limitations

1. **No drag-and-drop reordering:** Used arrow buttons instead
   - Simpler implementation without external libraries
   - Works on all devices (mobile, desktop, touch, keyboard)
   - More predictable behavior
   - Can enhance with drag-and-drop in future if user feedback requests it

2. **Browser confirm() for delete:** Native dialog, not custom modal
   - Quick to implement for v1
   - Familiar UX pattern
   - Cannot be styled to match app theme
   - Can replace with custom modal in future

3. **No undo on delete:** Template immediately deleted
   - Could add soft delete or trash feature
   - For v1, confirmation dialog provides safety

4. **No template preview before save:** Direct save on form submission
   - User can see items as they build in the form
   - Edit flow allows fixing after creation
   - Could add preview step if user feedback requests it

## Next Phase Readiness

**Blockers:** None

**Dependencies satisfied:**
- ✓ Template CRUD API functional (from 03-01)
- ✓ User authentication provides session
- ✓ Database stores templates and items

**What's ready for next plans:**
- Template library populated with user templates
- Users can create and edit templates
- Templates have multiple ordered items
- UI follows established design patterns
- Ready for template instantiation flow (03-03)

**Recommended next steps:**
- Build template selection UI for instantiation (03-03)
- Implement template merge logic with deduplication
- Create working checklist view

## Maintenance Notes

### Modifying TemplateForm
- Component is reused by both create and edit pages
- Props interface must remain compatible with both use cases
- Changes affect both flows - test both after modifications

### Adding New Template Operations
Follow established patterns:
- Use useSession for auth checks
- Client components with "use client" directive
- fetch to /api/templates endpoints
- router.push for navigation after success
- Error state display for user feedback
- Loading state during async operations

### Styling Updates
- Uses Tailwind CSS classes
- Follow color scheme from login/signup
- Maintain responsive breakpoints (md:, lg:)
- Ensure focus states visible for accessibility

## Git History

### Commits
- `cb749e8`: feat(03-02): create template library list page
- `38f1174`: feat(03-02): create template form component and pages

### Files Changed
```
app/templates/page.tsx                  | 176+ (library list view)
app/components/TemplateForm.tsx         | 255+ (reusable form)
app/templates/new/page.tsx              | 57+  (create page)
app/templates/[id]/edit/page.tsx        | 130+ (edit page)
```

**Total:** 618 lines added across 4 files

## Success Metrics

- ✓ Template library displays all user templates (TMPL-04)
- ✓ Create new template with multiple items (TMPL-01)
- ✓ Edit existing template - name, items, order (TMPL-02)
- ✓ Delete template from library (TMPL-03)
- ✓ Both Enter key and button add items (CONTEXT.md requirement)
- ✓ Item reordering works (arrow buttons)
- ✓ UI responsive and follows established patterns
- ✓ All pages require authentication
- ✓ Empty states implemented
- ✓ Error handling throughout
- ✓ Loading states during async operations
- ✓ Optimistic UI on delete
- ✓ Keyboard navigation functional

**Result:** Complete template management UI ready for instantiation feature
