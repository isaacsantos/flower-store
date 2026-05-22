# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Mobile Overflow and Missing Toggle Button
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases:
    - At viewport ≤640px, `.admin-products-table` should NOT have `min-width: 900px` (currently does)
    - A toggle button should exist in each product row's active status cell (currently missing)
  - Test that at viewport ≤640px the table element does not enforce `min-width: 900px` (from Bug Condition: `input.viewportWidth <= 640 AND tableHasMinWidth900()`)
  - Test that a toggle button element exists in the active status cell for each product row (from Bug Condition: `input.action === 'toggleActive' AND toggleButtonDoesNotExist()`)
  - Test that clicking the toggle button sends a PUT to `${ADMIN_API_URL}/${product.id}` with inverted `active` value
  - Run test on UNFIXED code - expect FAILURE (this confirms the bug exists)
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "table has min-width: 900px at 375px viewport", "no toggle button found in active cell")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Desktop Layout and Edit/Delete Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: At viewport >640px, `.admin-products-table` has `min-width: 900px` on unfixed code
  - Observe: `.admin-products-table-wrapper` has `overflow-x: auto` on unfixed code
  - Observe: Clicking edit button calls `handleEditClick` and shows ProductForm with correct product
  - Observe: Clicking delete button calls `window.confirm` and sends DELETE request on confirmation
  - Observe: Mobile card-view renders `data-label` attributes on each `<td>` element
  - Write property-based test: for all viewport widths >640px, table retains `min-width: 900px` and wrapper has horizontal scroll (from Preservation Requirements in design)
  - Write property-based test: for all products, edit button opens ProductForm and delete button triggers confirmation + API call (from Preservation Requirements in design)
  - Write property-based test: for all viewport widths ≤640px, card-view `data-label` attributes are still rendered on each cell
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix mobile overflow and add toggle button

  - [x] 3.1 Add `min-width: auto` to `.admin-products-table` in the ≤640px media query
    - In `src/components/ProductsTable.css`, inside the existing `@media (max-width: 640px)` block, add `min-width: auto` to the `.admin-products-table` selector to override the base `min-width: 900px`
    - _Bug_Condition: isBugCondition(input) where input.viewportWidth <= 640 AND tableHasMinWidth900()_
    - _Expected_Behavior: table fits within viewport without horizontal overflow_
    - _Preservation: Desktop (>640px) table layout with min-width: 900px must remain unchanged_
    - _Requirements: 2.1, 3.1_

  - [x] 3.2 Add `.admin-products-toggle-btn` CSS styles
    - Add toggle button styles in `src/components/ProductsTable.css` with ≥44px touch target on mobile
    - Use existing color variables (`--rose`, `#dcfce7`, `#16a34a`, `#fef2f2`, `#dc2626`) for active/inactive states
    - Ensure button has appropriate sizing, border-radius, and transition
    - In the ≤640px media query, ensure toggle button has `min-width: 44px` and `min-height: 44px`
    - _Requirements: 2.2_

  - [x] 3.3 Add toggle-related translation keys to all 4 locales
    - In `src/i18n/translations.js`, add to all four locales (`es`, `en`, `fr`, `ko`):
      - `admin.products.toggle.activate` — label for activating a product
      - `admin.products.toggle.deactivate` — label for deactivating a product
      - `admin.products.error.toggle` — error message when toggle fails
    - _Requirements: 2.2_

  - [x] 3.4 Add `handleToggleActive` async function and toggling state in ProductsTable.jsx
    - Add `const [togglingIds, setTogglingIds] = useState(new Set())` to track in-flight toggles
    - Add `handleToggleActive(product)` that:
      - Adds `product.id` to `togglingIds` to prevent double-clicks
      - Sends PUT to `${ADMIN_API_URL}/${product.id}` with `{ ...product, active: !product.active }` via `apiRequest`
      - On success: updates local `products` state to reflect new `active` value
      - On failure: sets error via `setError(t('admin.products.error.toggle'))`
      - Removes `product.id` from `togglingIds` in finally block
    - _Bug_Condition: isBugCondition(input) where input.action === 'toggleActive' AND toggleButtonDoesNotExist()_
    - _Expected_Behavior: PUT request sent with inverted active value, local state updated on success_
    - _Preservation: Edit and delete handlers remain unchanged_
    - _Requirements: 2.2, 3.2, 3.3_

  - [x] 3.5 Replace read-only badge with toggle button in each product row
    - In the active status `<td>`, replace the `<span className="admin-products-badge ...">` with a `<button>` element:
      - Class: `admin-products-toggle-btn` plus active/inactive modifier
      - onClick: `() => handleToggleActive(product)`
      - disabled: `togglingIds.has(product.id)`
      - aria-label: `t(product.active ? 'admin.products.toggle.deactivate' : 'admin.products.toggle.activate')`
      - Content: `t(product.active ? 'admin.products.active.yes' : 'admin.products.active.no')`
    - _Bug_Condition: toggleButtonDoesNotExist() in active status cell_
    - _Expected_Behavior: clickable toggle button exists with ≥44px touch target on mobile_
    - _Preservation: Badge text still shows active/inactive status using same translation keys_
    - _Requirements: 2.2_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Mobile Overflow and Missing Toggle Button
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Desktop Layout and Edit/Delete Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
