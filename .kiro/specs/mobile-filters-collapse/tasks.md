# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Mobile Filters Not Collapsible
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists (no collapse mechanism on mobile)
  - **Scoped PBT Approach**: For any viewport ≤640px with any set of tag groups, assert that:
    - A main "Filters" toggle button exists in the sidebar
    - The filter panel is collapsed by default (tag lists not visible initially)
    - Each tag group has its own collapse/expand toggle button
    - All toggle buttons have a minimum touch target height of 44px
  - Bug Condition: `isBugCondition(input) WHERE input.viewportWidth <= 640`
  - Expected Behavior: Main filter toggle exists, panel collapsed by default, per-group toggles exist, all collapsed by default, 44px touch targets
  - Use fast-check to generate random tag configurations (1-10 groups, 1-20 tags per group) and verify collapse UI exists
  - Render Marketplace component with mocked tags API, query for toggle buttons
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (no toggle buttons exist in current code - confirms the bug)
  - Document counterexamples: e.g., "With 3 tag groups on 375px viewport, no `.mp-filter-toggle` button rendered, all `.mp-tag-list` elements visible unconditionally"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Desktop Sidebar Fully Expanded Without Toggles
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: On desktop (>640px), all `.mp-filter-group` sections render with visible `.mp-tag-list` elements, no toggle buttons present
  - Observe: Selecting/deselecting a tag updates `selectedTags` state without collapsing any UI
  - Observe: "Clear filters" button clears all selected tags
  - Write property-based tests with fast-check:
    - Generate random tag configurations (varying group count and tags per group)
    - For all desktop viewports (>640px): assert no `.mp-filter-toggle` or `.mp-group-toggle` buttons are rendered
    - For all desktop viewports: assert all `.mp-tag-list` elements are visible and contain the correct number of tag items
    - For all tag selection states: assert selecting a tag does not hide or collapse any filter UI
  - Verify tests pass on UNFIXED code (confirms baseline desktop behavior to preserve)
  - **EXPECTED OUTCOME**: Tests PASS (desktop sidebar is already fully expanded with no toggles)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Implement mobile filter collapse feature

  - [x] 3.1 Add translation keys for filter toggle labels
    - Add `'marketplace.filter.toggle'` to all 4 locales: "Filtros" (es), "Filters" (en), "Filtres" (fr), "필터" (ko)
    - Add `'marketplace.filter.activeCount'` to all 4 locales: "Filtros ({count})" (es), "Filters ({count})" (en), "Filtres ({count})" (fr), "필터 ({count})" (ko)
    - _Requirements: 2.5_

  - [x] 3.2 Add collapse state and toggle logic to Marketplace component
    - Add `const [filtersOpen, setFiltersOpen] = useState(false)` for main panel toggle (collapsed by default)
    - Add `const [expandedGroups, setExpandedGroups] = useState({})` for per-group toggles (all collapsed by default)
    - Render a `<button className="mp-filter-toggle">` before `.mp-filter-box` showing `t('marketplace.filter.toggle')` with active count when `selectedTags.length > 0`
    - Wrap `.mp-filter-box` rendering with `{filtersOpen && ...}` conditional
    - Replace static `<h4>` group titles with `<button className="mp-group-toggle">` that toggles `expandedGroups[type]`
    - Show chevron indicator (▸ collapsed, ▾ expanded) on group toggles
    - Wrap each `.mp-tag-list` with `{expandedGroups[type] && ...}` conditional
    - _Bug_Condition: isBugCondition(input) WHERE input.viewportWidth <= 640_
    - _Expected_Behavior: Main toggle exists, panel collapsed by default, per-group toggles with collapsed-by-default groups_
    - _Preservation: Desktop (>640px) behavior unchanged via CSS overrides_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.3 Add CSS for toggle buttons and responsive visibility
    - Add `.mp-filter-toggle` styles: `display: none` by default (desktop), visible on mobile (≤640px) with `min-height: 44px`, full-width, dark theme styling
    - Add `.mp-group-toggle` styles: `display: none` by default (desktop), visible on mobile (≤640px) with `min-height: 44px`, flex layout with chevron
    - Add desktop override: `.mp-filter-box` and `.mp-tag-list` always visible (`display: block !important` or similar) on >640px regardless of React state
    - In `@media (max-width: 640px)`: set `.mp-filter-toggle` and `.mp-group-toggle` to `display: flex`
    - Ensure `.mp-filter-group-title` styling is preserved when rendered inside a button
    - _Bug_Condition: isBugCondition(input) WHERE input.viewportWidth <= 640_
    - _Preservation: Toggle buttons hidden on desktop, filter box and tag lists always visible on desktop_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.4_

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Mobile Filters Collapsible After Fix
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (toggle buttons exist, panel collapsed by default, per-group toggles, 44px touch targets)
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Desktop Sidebar Unchanged After Fix
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions on desktop)
    - Confirm all desktop behavior is unchanged: no toggles visible, all groups expanded, tag selection works

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite to confirm no regressions
  - Verify exploration test (Property 1) passes after fix
  - Verify preservation test (Property 2) still passes after fix
  - Ensure all existing tests in the project continue to pass
  - Ask the user if questions arise
