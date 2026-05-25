# Implementation Plan: Product Condition

## Overview

Add `conditionType` ("NEW"/"USED") and `conditionRating` (1–10) fields across the flower-store frontend. The implementation modifies existing components (ProductForm, ProductsTable, Carousel, Marketplace, ProductDetail) and the shared translations file. All changes use the existing i18n system, responsive CSS patterns, and API client utilities already in the project.

## Tasks

- [x] 1. Add condition-related translation keys to all locales
  - [x] 1.1 Add condition translation keys to `src/i18n/translations.js`
    - Add keys for all four locales (es, en, fr, ko): `condition.type.new`, `condition.type.used`, `condition.rating.label`, `admin.products.col.condition`, `admin.products.col.conditionType`, `admin.products.col.conditionRating`, `admin.products.form.conditionType.placeholder`, `admin.products.form.conditionRating.placeholder`, `admin.products.validation.conditionType`, `admin.products.validation.conditionRating`, `marketplace.filter.conditionType`, `marketplace.filter.minRating`, `marketplace.filter.conditionType.new`, `marketplace.filter.conditionType.used`
    - Ensure identical key sets across all four locales
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 1.2 Write property test for translation key completeness (Property 9)
    - **Property 9: Translation key completeness across all locales**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [x] 2. Implement admin product form condition fields
  - [x] 2.1 Add conditionType select and conditionRating number input to `src/components/ProductForm.jsx`
    - Add `conditionType` state (empty on create, pre-populated on edit)
    - Add `conditionRating` state (empty on create, pre-populated on edit)
    - Add `<select>` for conditionType with placeholder and "NEW"/"USED" options using localized labels
    - Add `<input type="number" min="1" max="10" step="1">` for conditionRating
    - Include both fields in the JSON payload on form submission
    - All labels use `t()` from the locale system
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_

  - [x] 2.2 Add client-side validation for condition fields in `src/components/ProductForm.jsx`
    - Prevent submission if conditionType is not selected; show localized error adjacent to field
    - Prevent submission if conditionRating is empty, not an integer, or outside 1–10; show localized error adjacent to field
    - Use `<span className="admin-form-field-error">` for error messages
    - _Requirements: 1.5, 1.6_

  - [x] 2.3 Add responsive CSS for condition form fields in `src/components/ProductForm.css`
    - Full-width layout on mobile (≤640px) with 44px minimum touch target height
    - Style validation error messages
    - _Requirements: 6.4_

  - [x] 2.4 Write property test for edit form pre-population (Property 1)
    - **Property 1: Edit form pre-populates condition fields from product data**
    - **Validates: Requirements 1.3**

  - [x] 2.5 Write property test for form submission payload (Property 2)
    - **Property 2: Form submission payload includes correctly typed condition fields**
    - **Validates: Requirements 1.4**

  - [x] 2.6 Write property test for invalid rating rejection (Property 3)
    - **Property 3: Form validation rejects invalid conditionRating values**
    - **Validates: Requirements 1.5**

- [-] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement admin products table condition column
  - [x] 4.1 Add "Condition" column to `src/components/ProductsTable.jsx`
    - Add localized column header after "Tags" column, before "Actions"
    - Render cell: if product has conditionType AND conditionRating, display `"{localizedType} ({rating}/10)"`; otherwise display empty cell
    - Use `t('condition.type.new')` / `t('condition.type.used')` for localized type labels
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.2 Write property test for table condition cell formatting (Property 4)
    - **Property 4: Admin table condition cell formatting**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 5. Implement carousel condition tag
  - [x] 5.1 Modify tag logic in `src/components/Carousel.jsx` ProductCard
    - If `product.conditionType` is non-null and non-empty, display `t('condition.type.${product.conditionType.toLowerCase()}')` in the `.card-tag` element
    - If `product.conditionType` is null, undefined, or empty string, fall back to existing index-based `TAG_KEYS` rotation
    - Preserve existing `.card-tag` element structure and styling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.2 Add responsive CSS adjustments for condition tag in `src/components/Carousel.css`
    - Ensure minimum font size of 10px on the tag
    - Tag remains fully visible without truncation at all breakpoints
    - Tag stays positioned within the card image area
    - _Requirements: 6.1_

  - [x] 5.3 Write property test for carousel condition tag display (Property 5)
    - **Property 5: Carousel tag displays localized condition type**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 5.4 Write property test for carousel tag fallback (Property 6)
    - **Property 6: Carousel tag falls back to index-based label when condition is absent**
    - **Validates: Requirements 3.4**

- [-] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement marketplace condition filters
  - [-] 7.1 Add condition type and minimum rating filter controls to `src/components/Marketplace.jsx`
    - Add `conditionType` state (null by default) with radio/checkbox options "New" and "Used" using localized labels
    - Add `minRating` state (null by default) with a `<select>` offering values 1–10
    - Place filter controls inside the existing `.mp-filter-box` sidebar
    - Selecting a filter resets pagination to page 0
    - Include `conditionType` and `conditionRating` query parameters in the API fetch alongside existing `tagIds` and `search` params
    - Clearing filters removes condition params and re-fetches
    - On API error, preserve filter selections and show localized error message
    - Use AbortController with 10-second timeout for condition-filtered requests
    - All filter labels use `t()` from the locale system
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [~] 7.2 Add responsive CSS for marketplace condition filters in `src/components/Marketplace.css`
    - Filters visible and operable within collapsible filter panel on mobile (≤640px)
    - Filter toggle button has minimum 44px touch target height
    - No horizontal overflow at any breakpoint
    - _Requirements: 6.2, 6.5_

  - [~] 7.3 Write property test for marketplace filter API parameters (Property 7)
    - **Property 7: Marketplace condition filters produce correct API parameters**
    - **Validates: Requirements 4.2, 4.4**

- [ ] 8. Implement product detail condition display
  - [-] 8.1 Add condition badge and rating to `src/components/ProductDetail.jsx`
    - Render condition section between price and description when `product.conditionType` is non-null
    - Display localized badge with CSS class `pd-condition-badge--new` or `pd-condition-badge--used`
    - Display rating in format `{conditionRating}/10` with localized label
    - Hide condition section entirely when `conditionType` is absent/null
    - All labels use `t()` from the locale system
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [~] 8.2 Add responsive CSS for product detail condition section in `src/components/ProductDetail.css`
    - Badge and rating display inline (side by side) on desktop (>900px) and tablet (≤900px)
    - Stack vertically on mobile (≤640px)
    - No overlapping with adjacent elements at any breakpoint
    - _Requirements: 6.3, 6.5_

  - [~] 8.3 Write property test for product detail condition display (Property 8)
    - **Property 8: Product detail displays condition badge and rating**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [~] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The design uses React/JSX directly, so no language selection was needed
- All components already use `useLocale()` — condition labels follow the same pattern
- Existing responsive CSS patterns (desktop-first with media query overrides) are maintained

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.1", "5.1"] },
    { "id": 3, "tasks": ["2.4", "2.5", "2.6", "4.2", "5.2", "5.3", "5.4"] },
    { "id": 4, "tasks": ["7.1", "8.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "8.2", "8.3"] }
  ]
}
```
