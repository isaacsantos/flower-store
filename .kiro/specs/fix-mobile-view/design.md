# Fix Mobile View Bugfix Design

## Overview

The Admin ProductsTable component has two bugs: (1) on mobile viewports (≤640px), the table retains `min-width: 900px` causing horizontal overflow despite card-view CSS being applied, and (2) there is no quick toggle button to enable/disable a product's active status from the table row. The fix removes the min-width constraint in the mobile media query and adds an inline toggle button that calls the existing PUT endpoint.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bugs — viewport ≤640px with min-width still applied, or any viewport where the toggle button is missing
- **Property (P)**: The desired behavior — no horizontal overflow on mobile, and a clickable toggle button in each row that updates the product's `active` field via API
- **Preservation**: Existing table layout on desktop (>640px), edit/delete button behavior, card-view data-label rendering on mobile
- **ProductsTable**: The component in `src/components/ProductsTable.jsx` that renders the admin product list
- **apiRequest**: The utility in `src/utils/apiClient.js` that handles authenticated API calls with Firebase JWT

## Bug Details

### Bug Condition

The bug manifests in two scenarios: (1) when the viewport is ≤640px, the `.admin-products-table` still has `min-width: 900px` because the mobile media query never overrides it, causing horizontal scroll even though card-view display rules are applied; (2) at any viewport width, there is no toggle button to quickly change a product's `active` status — only a read-only badge is shown.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { viewportWidth: number, action: string }
  OUTPUT: boolean

  RETURN (input.viewportWidth <= 640 AND tableHasMinWidth900())
         OR (input.action === 'toggleActive' AND toggleButtonDoesNotExist())
END FUNCTION
```

### Examples

- Viewport 375px: table overflows horizontally because `min-width: 900px` is still applied → expected: no overflow, card layout fits within viewport
- Viewport 640px: same overflow issue → expected: card layout without horizontal scroll
- Any viewport, user wants to toggle product active status: must open full edit form → expected: a toggle button in the row triggers a PUT request to flip `active`
- Viewport 1280px (desktop): table renders normally with `min-width: 900px` and horizontal scroll wrapper → expected: unchanged behavior

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Desktop (>640px) table layout with `min-width: 900px` and horizontal scroll wrapper must continue to work
- Edit button must continue to open the product edit form
- Delete button must continue to prompt confirmation and delete the product
- Mobile card-view must continue to display each row as a card with `data-label` attributes
- Pagination must continue to work identically
- All existing translation keys must remain unchanged

**Scope:**
All inputs that do NOT involve the mobile viewport overflow or the missing toggle button should be completely unaffected by this fix. This includes:
- Desktop table rendering
- Edit/delete workflows
- Product loading and pagination
- AI product creation modal

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Missing min-width override in mobile media query**: The `@media (max-width: 640px)` block in `ProductsTable.css` sets `display: block` on the table but never sets `min-width: auto` or `min-width: 0` to override the base `min-width: 900px` rule. The browser still enforces the 900px minimum even though the table is displayed as block.

2. **No toggle button component exists**: The JSX only renders a `<span>` badge showing active/inactive status. There is no `<button>` element that calls an API to toggle the `active` field. The handler function and the UI element are both missing.

3. **No translation keys for toggle**: The i18n translations do not include keys for the toggle button's label/aria-label or success/error states.

## Correctness Properties

Property 1: Bug Condition - Mobile Table No Horizontal Overflow

_For any_ viewport width ≤640px, the ProductsTable component SHALL render without horizontal overflow by removing the `min-width` constraint on `.admin-products-table` in the mobile media query, allowing the card-view layout to fit within the viewport width.

**Validates: Requirements 2.1**

Property 2: Bug Condition - Toggle Button Triggers Active Status Change

_For any_ product row displayed in the ProductsTable, the component SHALL render a toggle button with ≥44px touch target on mobile that, when clicked, sends a PUT request to `${ADMIN_API_URL}/${product.id}` with the inverted `active` value and updates the local state on success.

**Validates: Requirements 2.2**

Property 3: Preservation - Desktop Table Layout Unchanged

_For any_ viewport width >640px, the ProductsTable component SHALL continue to render the table with `min-width: 900px` inside a horizontally scrollable wrapper, preserving the existing desktop layout.

**Validates: Requirements 3.1**

Property 4: Preservation - Edit and Delete Behavior Unchanged

_For any_ interaction with the edit or delete buttons, the ProductsTable component SHALL produce exactly the same behavior as the original code, preserving form opening and delete confirmation workflows.

**Validates: Requirements 3.2, 3.3**

## Fix Implementation

### Changes Required

**File**: `src/components/ProductsTable.css`

**Specific Changes**:
1. **Add min-width override in mobile media query**: Inside the existing `@media (max-width: 640px)` block, add `min-width: auto` (or `min-width: 0`) to the `.admin-products-table` rule to override the base `min-width: 900px`.

2. **Add toggle button styles**: Add `.admin-products-toggle-btn` styles with appropriate sizing (≥44px touch target on mobile), using the existing color variables for active/inactive states.

---

**File**: `src/components/ProductsTable.jsx`

**Function**: `ProductsTable` (default export)

**Specific Changes**:
1. **Add `handleToggleActive` async function**: Sends a PUT request to `${ADMIN_API_URL}/${product.id}` with `{ ...product, active: !product.active }` using `apiRequest`. On success, updates local `products` state to reflect the new active value. On failure, sets error state.

2. **Add toggle button in the active status cell**: Replace the read-only badge `<span>` with a `<button>` that displays the current status and calls `handleToggleActive(product)` on click. Include proper `aria-label` using `t()` for accessibility.

3. **Add toggling state tracking**: Use a `Set` or state variable to track which product IDs are currently being toggled, to disable the button during the API call and prevent double-clicks.

---

**File**: `src/i18n/translations.js`

**Specific Changes**:
1. **Add translation keys** to all four locales (`es`, `en`, `fr`, `ko`):
   - `admin.products.toggle.activate` — label for activating a product
   - `admin.products.toggle.deactivate` — label for deactivating a product
   - `admin.products.error.toggle` — error message when toggle fails

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Inspect the computed CSS of `.admin-products-table` at ≤640px viewport to confirm `min-width: 900px` is still applied. Inspect the DOM to confirm no toggle button exists in the active status cell.

**Test Cases**:
1. **Mobile Overflow Test**: Render ProductsTable at 375px viewport width, assert that the table wrapper does not have horizontal scroll (will fail on unfixed code)
2. **Toggle Button Existence Test**: Render ProductsTable with products, assert a toggle button exists in each row (will fail on unfixed code)
3. **Toggle API Call Test**: Click the toggle button and assert a PUT request is made with inverted `active` value (will fail on unfixed code)
4. **Toggle Touch Target Test**: At 375px viewport, assert the toggle button has min 44px dimensions (will fail on unfixed code)

**Expected Counterexamples**:
- Table element has computed `min-width: 900px` at mobile viewport causing overflow
- No button element with toggle functionality exists in the active status cell

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL viewport WHERE viewport.width <= 640 DO
  rendered := renderProductsTable(viewport)
  ASSERT computedStyle(rendered.table).minWidth != '900px'
  ASSERT rendered.tableWrapper.scrollWidth <= rendered.tableWrapper.clientWidth
END FOR

FOR ALL product IN products DO
  toggleBtn := findToggleButton(product.row)
  ASSERT toggleBtn EXISTS
  ASSERT toggleBtn.onClick triggers PUT with { active: !product.active }
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL viewport WHERE viewport.width > 640 DO
  ASSERT computedStyle(rendered.table).minWidth == '900px'
  ASSERT tableWrapper has overflow-x: auto
END FOR

FOR ALL interaction IN [editClick, deleteClick, pagination] DO
  ASSERT behavior_fixed(interaction) == behavior_original(interaction)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for edit/delete/pagination interactions, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Desktop Layout Preservation**: Verify table renders with `min-width: 900px` at viewport >640px after fix
2. **Edit Button Preservation**: Verify clicking edit still opens ProductForm with the correct product
3. **Delete Button Preservation**: Verify clicking delete still shows confirmation and calls DELETE endpoint
4. **Card View Labels Preservation**: Verify mobile card view still shows `data-label` attributes correctly

### Unit Tests

- Test that `.admin-products-table` has `min-width: auto` at ≤640px viewport
- Test that toggle button renders for each product row
- Test that clicking toggle button calls `apiRequest` with correct PUT payload
- Test that toggle button is disabled while API call is in flight
- Test that local state updates on successful toggle
- Test that error state is set on failed toggle

### Property-Based Tests

- Generate random viewport widths and verify: if ≤640px then no min-width constraint, if >640px then min-width: 900px preserved
- Generate random product states (active/inactive) and verify toggle always inverts the value correctly
- Generate random product lists and verify edit/delete buttons continue to function identically

### Integration Tests

- Test full flow: render table → click toggle → verify API call → verify UI updates
- Test toggle error handling: simulate API failure → verify error message displayed
- Test mobile layout: render at 375px → verify no horizontal scroll → verify toggle button has 44px touch target
