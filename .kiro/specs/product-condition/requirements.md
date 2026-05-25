# Requirements Document

## Introduction

This feature adds product condition information (`conditionType` and `conditionRating`) to the flower-store frontend. The backend API already returns and accepts these fields in product payloads. The frontend must display and allow editing of these values across the admin view, carousel, marketplace, and product detail views.

## Glossary

- **Product_API**: The external REST API at `https://product-43vr.onrender.com/api/products` that returns and accepts product data including `conditionType` and `conditionRating` fields.
- **Condition_Type**: A string enum field on a product with exactly two valid values: `"NEW"` or `"USED"`.
- **Condition_Rating**: An integer field on a product with valid values from 1 to 10 inclusive.
- **Admin_View**: The authenticated admin interface (`ProductsTable` and `ProductForm` components) used to manage products.
- **Carousel_View**: The homepage product carousel component that displays product cards with tags.
- **Marketplace_View**: The store page with product grid and filtering capabilities.
- **Product_Detail_View**: The individual product page showing full product information.
- **Locale_System**: The i18n system using `useLocale()` and `translations.js` supporting `es`, `en`, `fr`, and `ko` locales.

## Requirements

### Requirement 1: Admin Product Form — Condition Fields

**User Story:** As an admin, I want to set and edit the condition type and rating for a product, so that customers can see whether a product is new or used and its quality rating.

#### Acceptance Criteria

1. WHEN the admin opens the product creation form, THE Admin_View SHALL display a select input for Condition_Type with options "NEW" and "USED", with no option pre-selected (placeholder prompt visible).
2. WHEN the admin opens the product creation form, THE Admin_View SHALL display a numeric input for Condition_Rating accepting only integer values from 1 to 10 inclusive, with the field initially empty.
3. WHEN the admin opens the product edit form for a product that has existing Condition_Type and Condition_Rating values, THE Admin_View SHALL pre-populate the Condition_Type select and Condition_Rating input with those stored values.
4. WHEN the admin submits the product form with valid Condition_Type and Condition_Rating values, THE Admin_View SHALL include `conditionType` (string) and `conditionRating` (integer) in the JSON payload sent to the Product_API.
5. IF the admin enters a Condition_Rating value that is not an integer or is outside the range 1 to 10, THEN THE Admin_View SHALL prevent form submission and display a validation error message adjacent to the Condition_Rating field.
6. IF the admin attempts to submit the product form without selecting a Condition_Type or without entering a Condition_Rating, THEN THE Admin_View SHALL prevent form submission and display a validation error message adjacent to each missing field.
7. THE Admin_View SHALL display the Condition_Type field label, option labels ("NEW" and "USED"), and the Condition_Rating field label using the Locale_System.

### Requirement 2: Admin Products Table — Condition Display

**User Story:** As an admin, I want to see the condition type and rating in the products table, so that I can quickly review product conditions without opening the edit form.

#### Acceptance Criteria

1. THE Admin_View SHALL display a "Condition" column in the products table, positioned after the existing columns, using the localized column header from the Locale_System.
2. IF a product has Condition_Type "NEW", THEN THE Admin_View SHALL display the localized label for "New" followed by the Condition_Rating formatted as "({rating}/10)" in the condition column.
3. IF a product has Condition_Type "USED", THEN THE Admin_View SHALL display the localized label for "Used" followed by the Condition_Rating formatted as "({rating}/10)" in the condition column.
4. IF a product has no Condition_Type value or no Condition_Rating value, THEN THE Admin_View SHALL display an empty cell in the condition column.

### Requirement 3: Carousel Tag — Condition Type Display

**User Story:** As a customer, I want to see whether a product is new or used directly on the carousel card, so that I can quickly identify product condition while browsing.

#### Acceptance Criteria

1. THE Carousel_View SHALL display the product Condition_Type as the card tag instead of the index-based rotating label drawn from the static TAG_KEYS list.
2. WHEN a product has Condition_Type "NEW", THE Carousel_View SHALL display the localized text "Nuevo" (es), "New" (en), "Nouveau" (fr), "새 상품" (ko) in the card tag.
3. WHEN a product has Condition_Type "USED", THE Carousel_View SHALL display the localized text "Usado" (es), "Used" (en), "Occasion" (fr), "중고" (ko) in the card tag.
4. IF a product's Condition_Type field is null, undefined, an empty string, or absent from the API response, THEN THE Carousel_View SHALL fall back to the existing index-based rotating tag label selected from the TAG_KEYS list.
5. THE Carousel_View SHALL render the condition tag text within the existing `.card-tag` element, preserving the current tag position and styling.

### Requirement 4: Marketplace Filters — Condition Filtering

**User Story:** As a customer, I want to filter products by condition type and rating in the marketplace, so that I can find products matching my preference for new or used items.

#### Acceptance Criteria

1. THE Marketplace_View SHALL display a filter section for Condition_Type with options "New" and "Used" using localized labels, with no option selected by default so that all products are shown regardless of condition type.
2. WHEN the customer selects a Condition_Type filter, THE Marketplace_View SHALL reset pagination to the first page, send the `conditionType` parameter along with any active tag or search parameters to the Product_API, and display only products matching the selected condition type.
3. THE Marketplace_View SHALL display a filter for Condition_Rating allowing the customer to select a minimum rating value from 1 to 10, with no value selected by default so that all products are shown regardless of rating.
4. WHEN the customer selects a minimum Condition_Rating filter, THE Marketplace_View SHALL reset pagination to the first page, send the `conditionRating` parameter along with any active tag or search parameters to the Product_API, and display only products with a rating equal to or greater than the selected value.
5. WHEN the customer clears condition filters, THE Marketplace_View SHALL remove the condition type and rating filter parameters, reset pagination to the first page, and re-fetch products using only the remaining active filters.
6. THE Marketplace_View SHALL display all filter labels using the Locale_System.
7. IF the Product_API returns an error or fails to respond within 10 seconds when condition filters are applied, THEN THE Marketplace_View SHALL display a localized error message and preserve the customer's current filter selections.

### Requirement 5: Product Detail — Condition Information

**User Story:** As a customer, I want to see the full condition information on the product detail page, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. THE Product_Detail_View SHALL display the Condition_Type as a localized badge indicating "New" or "Used".
2. THE Product_Detail_View SHALL display the Condition_Rating in the format "{value}/10", where {value} is the integer Condition_Rating (1–10).
3. WHEN a product has Condition_Type "NEW", THE Product_Detail_View SHALL apply a distinct CSS class to the condition badge that differs from the class applied for "USED" products.
4. WHEN a product has Condition_Type "USED", THE Product_Detail_View SHALL apply a distinct CSS class to the condition badge that differs from the class applied for "NEW" products.
5. IF a product's Condition_Type field is absent or null, THEN THE Product_Detail_View SHALL not render the condition section.
6. THE Product_Detail_View SHALL display all condition labels using the Locale_System.

### Requirement 6: Responsive Design — Condition UI Elements

**User Story:** As a customer on any device, I want the condition information to display correctly, so that I have a consistent experience across mobile, tablet, and desktop.

#### Acceptance Criteria

1. THE Carousel_View condition tag SHALL render with a minimum font size of 10px, remain fully visible without text truncation, and stay positioned within the card image area on mobile (≤640px), tablet (≤900px), and desktop (>900px) viewports.
2. THE Marketplace_View condition filters SHALL be visible and operable within the collapsible filter panel on mobile viewports (≤640px), with the filter toggle button having a minimum touch target height of 44px.
3. THE Product_Detail_View condition badge and rating SHALL display inline (side by side) on desktop (>900px) and tablet (≤900px) viewports, and stack vertically on mobile (≤640px) viewports, without overlapping adjacent elements at any breakpoint.
4. THE Admin_View condition form fields SHALL be operable with touch targets of at least 44px height and full-width layout on mobile viewports (≤640px).
5. WHILE the viewport width changes between breakpoints (mobile ≤640px, tablet ≤900px, desktop >900px), THE condition UI elements across all views SHALL reflow without horizontal overflow or content clipping.

### Requirement 7: Internationalization — Condition Labels

**User Story:** As a user in any supported locale, I want condition information displayed in my language, so that I can understand product conditions without language barriers.

#### Acceptance Criteria

1. THE Locale_System SHALL include translation keys for Condition_Type labels ("New", "Used") in all four supported locales (es, en, fr, ko), using dot-notation keys scoped to the component where they are displayed (e.g., `condition.type.new`, `condition.type.used`).
2. THE Locale_System SHALL include a translation key for the condition rating display label (the text label shown alongside the numeric rating value on product views) in all four supported locales.
3. THE Locale_System SHALL include translation keys for the admin form field labels (condition type, condition rating) in all four supported locales, scoped under the admin namespace (e.g., `admin.products.col.conditionType`, `admin.products.col.conditionRating`).
4. THE Locale_System SHALL include translation keys for the marketplace filter labels (condition type filter, minimum rating filter) in all four supported locales, scoped under the marketplace namespace (e.g., `marketplace.filter.conditionType`, `marketplace.filter.minRating`).
5. THE Locale_System SHALL maintain an identical set of condition-related translation keys across all four supported locales (es, en, fr, ko), such that no locale is missing a key present in another.
