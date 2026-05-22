# Mobile Filters Collapse Bugfix Design

## Overview

On mobile viewports (≤640px), the Marketplace filter sidebar renders all tag groups fully expanded, consuming excessive vertical space before any products are visible. The fix introduces a two-level collapse system: a main "Filters" toggle button (collapsed by default) and per-tag-group toggles (each collapsed by default when the panel is open). On desktop (>640px), no toggles are shown and behavior remains unchanged.

## Glossary

- **Bug_Condition (C)**: The viewport is ≤640px — the mobile breakpoint where filters should be collapsible but currently are not
- **Property (P)**: On mobile, the filter panel is collapsed by default behind a toggle button, and each tag group within it is individually collapsible
- **Preservation**: On desktop (>640px), the sidebar remains fully expanded with no toggle buttons visible; tag selection and clear-filters behavior remain unchanged on all viewports
- **`Marketplace`**: The component in `src/components/Marketplace.jsx` that renders the filter sidebar and product grid
- **`.mp-sidebar`**: The aside element containing all filter groups
- **`.mp-filter-group`**: A section within the sidebar grouping tags by `tag.type`
- **`filtersOpen`**: React state controlling whether the entire filter panel is visible on mobile
- **`expandedGroups`**: React state (object or set) tracking which tag groups are individually expanded on mobile

## Bug Details

### Bug Condition

The bug manifests when the viewport width is ≤640px. The `.mp-sidebar` renders all `.mp-filter-group` sections fully expanded with no mechanism to collapse them, forcing users to scroll past all filters before reaching the product grid.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ViewportState
  OUTPUT: boolean

  RETURN input.viewportWidth <= 640
END FUNCTION
```

### Examples

- User on a 375px mobile device visits the Marketplace: sees all filter groups (e.g., Genre, Platform, Rating) fully expanded at the top, must scroll 400+ pixels to reach products. Expected: sees a collapsed "Filters" button, products are immediately visible.
- User on a 640px device with 5 tag groups: all 5 groups render open simultaneously. Expected: a "Filters (2)" button (if 2 tags selected) that expands to show collapsed group headers.
- User taps "Filters" button on mobile, then taps "Genre" group header: only Genre expands, other groups stay collapsed. Expected: independent per-group toggle behavior.
- User on a 1280px desktop: sidebar is fully expanded with all groups visible, no toggle buttons present. Expected: no change from current behavior.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- On desktop (>640px), the sidebar displays all filter groups fully expanded with no collapse toggles visible
- On desktop, the sidebar remains 220px wide with sticky positioning at `top: 5.5rem`
- On all viewports, selecting/deselecting a tag updates the product grid without closing the filter panel or tag group
- On all viewports, "Clear filters" clears all selected tags and resets the product listing
- Tag rendering order (grouped by `tag.type`) remains the same
- The filter heading row with "Clear filters" button continues to function identically

**Scope:**
All inputs on viewports >640px should be completely unaffected by this fix. On mobile, only the visibility/collapse state of the filter panel and groups changes — tag selection logic, API calls, pagination, and product grid rendering are untouched.

## Hypothesized Root Cause

Based on the bug description, the issue is a missing feature rather than broken logic:

1. **No Main Filter Toggle**: The `Marketplace` component unconditionally renders the `.mp-filter-box` contents. There is no state or button to collapse/expand the entire filter panel on mobile.

2. **No Per-Group Collapse**: Each `.mp-filter-group` unconditionally renders its `.mp-tag-list`. There is no state or toggle to collapse individual groups.

3. **No Responsive Visibility Control**: The CSS has no rules to hide toggle buttons on desktop or show them only on mobile. The toggle UI elements simply don't exist yet.

4. **Default State Not Considered**: Since no collapse mechanism exists, there is no concept of "collapsed by default" for mobile users.

## Correctness Properties

Property 1: Bug Condition - Mobile Filter Panel Collapsibility

_For any_ viewport state where the width is ≤640px, the Marketplace component SHALL render a main "Filters" toggle button that controls the visibility of the entire filter panel, with the panel collapsed by default so products are immediately visible. When expanded, each tag group SHALL have its own collapse toggle, with all groups collapsed by default.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Desktop Sidebar Unchanged

_For any_ viewport state where the width is >640px, the Marketplace component SHALL render the sidebar with all filter groups fully expanded and visible, with no collapse toggle buttons present, preserving the existing sticky sidebar layout and all interaction behaviors.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

**File**: `src/components/Marketplace.jsx`

**Function**: `Marketplace` (default export)

**Specific Changes**:
1. **Add state for main filter toggle**: `const [filtersOpen, setFiltersOpen] = useState(false)` — controls whether the filter panel is visible on mobile (collapsed by default).

2. **Add state for per-group toggles**: `const [expandedGroups, setExpandedGroups] = useState({})` — an object keyed by group type name, tracking which groups are expanded (all collapsed by default).

3. **Render main "Filters" toggle button**: Inside `.mp-sidebar`, before `.mp-filter-box`, render a button with class `mp-filter-toggle` that shows `t('marketplace.filter.toggle')` text plus active filter count (e.g., "Filters (3)"). This button calls `setFiltersOpen(prev => !prev)`.

4. **Conditionally render filter box**: Wrap `.mp-filter-box` content rendering with `{filtersOpen && ...}` so it's hidden when collapsed on mobile. On desktop, CSS ensures the filter box is always visible regardless of state.

5. **Per-group toggle buttons**: Replace the static `<h4>` group title with a `<button>` that toggles `expandedGroups[type]`. Show a chevron indicator (▸ when collapsed, ▾ when expanded).

6. **Conditionally render tag lists**: Wrap each `.mp-tag-list` with `{expandedGroups[type] && ...}` so tags are hidden when the group is collapsed on mobile. On desktop, CSS ensures tag lists are always visible.

**File**: `src/components/Marketplace.css`

**Specific Changes**:
1. **`.mp-filter-toggle`**: Style the main toggle button — hidden on desktop (`display: none`), visible on mobile with min-height 44px, full-width, styled consistently with the dark theme.

2. **`.mp-group-toggle`**: Style the per-group toggle button — hidden on desktop (`display: none`), visible on mobile with min-height 44px, full-width, flex layout with chevron.

3. **Desktop override**: In the base styles (no media query), set `.mp-filter-toggle` and `.mp-group-toggle` to `display: none`. In the `@media (max-width: 640px)` block, set them to `display: flex` (or `block`).

4. **Desktop always-visible overrides**: Ensure `.mp-filter-box` and `.mp-tag-list` are always visible on desktop regardless of React state by using CSS that overrides any inline display logic on larger viewports.

**File**: `src/i18n/translations.js`

**Specific Changes**:
1. Add `'marketplace.filter.toggle'` key to all 4 locales: "Filtros" (es), "Filters" (en), "Filtres" (fr), "필터" (ko)
2. Add `'marketplace.filter.activeCount'` key to all 4 locales for the active count format: "Filtros ({count})" (es), "Filters ({count})" (en), "Filtres ({count})" (fr), "필터 ({count})" (ko)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the sidebar renders without any collapse mechanism on mobile viewports.

**Test Plan**: Render the Marketplace component in a simulated mobile viewport and assert that no toggle buttons exist and all filter groups are unconditionally visible.

**Test Cases**:
1. **No Main Toggle Test**: Render Marketplace, query for a "Filters" toggle button — assert it does NOT exist (will pass on unfixed code, confirming the bug)
2. **All Groups Visible Test**: Render Marketplace with mock tags, assert all `.mp-tag-list` elements are visible with no collapse mechanism (confirms bug)
3. **No Chevron Indicators Test**: Assert no group toggle buttons with chevron indicators exist (confirms bug)

**Expected Counterexamples**:
- No toggle button is rendered for the filter panel
- All tag groups render their full tag lists unconditionally
- Confirms root cause: the collapse feature simply doesn't exist yet

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (mobile viewport), the fixed component provides proper collapse functionality.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := renderMarketplace_fixed(input)
  ASSERT result.hasMainFilterToggle = true
  ASSERT result.filterPanelCollapsedByDefault = true
  ASSERT FOR EACH group IN result.tagGroups:
    group.hasCollapseToggle = true
    group.collapsedByDefault = true
  ASSERT result.mainToggle.minHeight >= 44
  ASSERT result.groupToggles.ALL(t => t.minHeight >= 44)
  ASSERT result.toggleTexts.ALL(text => text uses t() function)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (desktop viewport >640px), the component produces the same rendered output as the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT renderMarketplace_original(input) = renderMarketplace_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many combinations of tag configurations and selected tags
- It catches edge cases where desktop rendering might accidentally be affected
- It provides strong guarantees that the sidebar structure is unchanged on desktop

**Test Plan**: Observe behavior on UNFIXED code first for desktop rendering (all groups visible, no toggles), then write property-based tests capturing that behavior.

**Test Cases**:
1. **Desktop No Toggles Preservation**: Verify that on desktop viewports, no `.mp-filter-toggle` or `.mp-group-toggle` buttons are visible in the DOM
2. **Desktop All Groups Expanded Preservation**: Verify that all `.mp-tag-list` elements render their full contents on desktop regardless of component state
3. **Tag Selection Preservation**: Verify that selecting/deselecting tags on mobile still updates the product grid and does not collapse the panel or group
4. **Clear Filters Preservation**: Verify that "Clear filters" continues to work on both mobile and desktop

### Unit Tests

- Test that the main "Filters" toggle button renders on mobile and is hidden on desktop
- Test that clicking the main toggle shows/hides the filter panel
- Test that per-group toggles render when the panel is open on mobile
- Test that clicking a group toggle expands only that group
- Test that the active filter count displays correctly in the toggle button text
- Test that all toggle buttons have min-height of 44px
- Test that translated text is used for all toggle labels

### Property-Based Tests

- Generate random tag configurations (varying number of groups and tags per group) and verify that on mobile, all groups start collapsed and each has a toggle
- Generate random sets of selected tags and verify the main toggle button shows the correct active count
- Generate random tag configurations and verify that on desktop, no toggle buttons are rendered and all groups are fully visible
- Generate random sequences of toggle interactions and verify groups expand/collapse independently

### Integration Tests

- Test full flow: load Marketplace on mobile, tap "Filters", tap a group, select a tag, verify product grid updates
- Test that expanding filters, selecting tags, then collapsing filters preserves the tag selection
- Test that the filter count updates in real-time as tags are selected/deselected
- Test responsive transition: verify that if viewport changes from mobile to desktop, all groups become visible
