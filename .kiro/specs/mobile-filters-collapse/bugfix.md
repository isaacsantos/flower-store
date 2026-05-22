# Bugfix Requirements Document

## Introduction

On mobile viewports (≤640px), the Marketplace filter sidebar (`.mp-sidebar`) renders all tag groups fully expanded at the top of the page. Because the layout switches to `flex-direction: column`, the sidebar occupies significant vertical space before any products are visible, forcing users to scroll extensively. This degrades the mobile shopping experience by burying the product grid below a wall of filter options.

The fix introduces two levels of collapsibility:
1. A top-level "Filters" toggle button that collapses/expands the entire filter panel on mobile.
2. Per-group collapse toggles so each tag type group can be individually expanded or collapsed.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the viewport width is ≤640px THEN the system displays all filter tag groups fully expanded at the top of the page with no way to collapse them, forcing users to scroll past all filters before seeing any products.

1.2 WHEN the viewport width is ≤640px AND there are multiple tag type groups THEN the system renders every group open simultaneously, compounding the vertical space consumed before the product grid.

1.3 WHEN the viewport width is ≤640px THEN the system provides no toggle or button to show/hide the entire filters section, offering no mechanism to skip past filters.

### Expected Behavior (Correct)

2.1 WHEN the viewport width is ≤640px THEN the system SHALL display a "Filters" toggle button that collapses or expands the entire filter panel, with the panel collapsed by default so products are immediately visible.

2.2 WHEN the viewport width is ≤640px AND the user expands the filter panel THEN the system SHALL display each tag type group with its own collapse/expand toggle, with all groups collapsed by default.

2.3 WHEN the viewport width is ≤640px AND the user taps a tag group toggle THEN the system SHALL expand only that group to reveal its tags, while other groups remain in their current collapsed/expanded state.

2.4 WHEN the viewport width is ≤640px THEN all toggle buttons (the main "Filters" button and per-group toggles) SHALL have a minimum touch target size of 44px.

2.5 WHEN the viewport width is ≤640px THEN all user-visible text for the toggle buttons SHALL use the `t()` function from `useLocale()` with translations provided in all 4 locales (es, en, fr, ko).

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the viewport width is >640px THEN the system SHALL CONTINUE TO display the sidebar with all filter groups fully expanded and visible (no collapse toggles), maintaining the current sticky sidebar layout.

3.2 WHEN the viewport width is ≤640px AND the user selects or deselects a tag filter THEN the system SHALL CONTINUE TO update the product grid based on the selected tags without closing the filter panel or the tag group.

3.3 WHEN the viewport width is ≤640px AND the user taps "Clear filters" THEN the system SHALL CONTINUE TO clear all selected tags and reset the product listing.

3.4 WHEN the viewport width is >640px THEN the system SHALL CONTINUE TO render the filter sidebar at 220px width with sticky positioning at `top: 5.5rem`.

---

## Bug Condition

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type ViewportState
  OUTPUT: boolean

  // The bug manifests when the viewport is mobile-sized
  RETURN X.viewportWidth <= 640
END FUNCTION
```

## Property Specification

```pascal
// Property: Fix Checking — Mobile filters are collapsible
FOR ALL X WHERE isBugCondition(X) DO
  sidebar ← renderMarketplaceSidebar(X)
  ASSERT sidebar.hasMainFilterToggle = true
  ASSERT sidebar.filterPanelCollapsedByDefault = true
  ASSERT FOR EACH group IN sidebar.tagGroups:
    group.hasCollapseToggle = true AND group.collapsedByDefault = true
  ASSERT sidebar.mainToggle.touchTargetHeight >= 44
  ASSERT sidebar.groupToggles.ALL(t => t.touchTargetHeight >= 44)
END FOR
```

## Preservation Goal

```pascal
// Property: Preservation Checking — Desktop behavior unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT renderMarketplaceSidebar(X) = renderMarketplaceSidebar_original(X)
END FOR
```
