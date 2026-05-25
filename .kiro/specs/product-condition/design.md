# Design Document: Product Condition

## Overview

This feature adds product condition visibility across the flower-store frontend. The backend API already provides `conditionType` (enum: `"NEW"` | `"USED"`) and `conditionRating` (integer 1–10) fields on product payloads. The frontend must:

1. Allow admins to set/edit these fields via the product form
2. Display condition info in the admin products table
3. Show condition type as the carousel card tag
4. Enable marketplace filtering by condition type and minimum rating
5. Present full condition details on the product detail page
6. Support all four locales (es, en, fr, ko) for condition labels
7. Maintain responsive design across mobile, tablet, and desktop breakpoints

The implementation touches existing components (`ProductForm`, `ProductsTable`, `Carousel`, `Marketplace`, `ProductDetail`) and the shared `translations.js` file. No new components are needed — all changes extend existing ones.

## Architecture

```mermaid
graph TD
    API[Product API] -->|GET /products| Carousel
    API -->|GET /products?conditionType&conditionRating| Marketplace
    API -->|GET /products/:id| ProductDetail
    API -->|POST/PUT /products| ProductForm

    subgraph Admin Views
        ProductForm -->|conditionType, conditionRating in payload| API
        ProductsTable -->|displays condition column| AdminHome
    end

    subgraph Customer Views
        Carousel -->|condition tag on card| HomePage
        Marketplace -->|condition filters| StorePage
        ProductDetail -->|condition badge + rating| DetailPage
    end

    Translations[translations.js] -->|t()| ProductForm
    Translations -->|t()| ProductsTable
    Translations -->|t()| Carousel
    Translations -->|t()| Marketplace
    Translations -->|t()| ProductDetail
```

**Data flow**: The API is the single source of truth. All views read `conditionType` and `conditionRating` from the product object returned by the API. The admin form writes these fields back via POST/PUT. Marketplace filters pass query parameters to the API for server-side filtering.

**No new state management** is needed — each component already manages its own local state via `useState`/`useEffect` hooks.

## Components and Interfaces

### 1. ProductForm (Modified)

**New fields added to the form:**

| Field | Type | UI Element | Validation |
|-------|------|-----------|------------|
| `conditionType` | `"NEW"` \| `"USED"` | `<select>` with placeholder | Required |
| `conditionRating` | integer 1–10 | `<input type="number" min="1" max="10" step="1">` | Required, integer, 1–10 |

**Behavior:**
- On create: both fields start empty (placeholder visible)
- On edit: pre-populated from `product.conditionType` and `product.conditionRating`
- Validation errors shown adjacent to each field using a `<span className="admin-form-field-error">` element
- Fields included in the JSON body sent to `ADMIN_API_URL`

### 2. ProductsTable (Modified)

**New column:** "Condition" added after the "Tags" column, before "Actions".

**Cell rendering logic:**
```
if (product.conditionType && product.conditionRating != null):
  display: "{localizedType} ({rating}/10)"
else:
  display: "" (empty cell)
```

### 3. Carousel / ProductCard (Modified)

**Tag logic change:**
```
if (product.conditionType):
  tag = t(`condition.type.${product.conditionType.toLowerCase()}`)
else:
  tag = t(TAG_KEYS[index % TAG_KEYS.length])  // existing fallback
```

No structural changes to the card — the tag text source changes but the `.card-tag` element remains identical.

### 4. Marketplace (Modified)

**New filter controls added to the sidebar filter box:**

| Filter | UI Element | API Parameter |
|--------|-----------|---------------|
| Condition Type | Two-option radio/checkbox group ("New", "Used") | `conditionType=NEW` or `conditionType=USED` |
| Min Rating | `<select>` with options 1–10 | `conditionRating={value}` |

**Behavior:**
- Selecting a filter resets pagination to page 0
- Filters are sent as query parameters alongside existing `tagIds` and `search` params
- Clearing filters removes condition params and re-fetches
- On API error, the error message is shown and filter selections are preserved

### 5. ProductDetail (Modified)

**New condition section** rendered between the price and description:

```jsx
{product.conditionType && (
  <div className="pd-condition">
    <span className={`pd-condition-badge pd-condition-badge--${product.conditionType.toLowerCase()}`}>
      {t(`condition.type.${product.conditionType.toLowerCase()}`)}
    </span>
    <span className="pd-condition-rating">
      {t('condition.rating.label')}: {product.conditionRating}/10
    </span>
  </div>
)}
```

- Badge gets a distinct CSS class per type (`--new` vs `--used`) for different styling
- Section hidden entirely when `conditionType` is absent/null

### 6. Translations (Modified)

New keys added to all four locales:

```
condition.type.new
condition.type.used
condition.rating.label
admin.products.col.condition
admin.products.col.conditionType
admin.products.col.conditionRating
admin.products.form.conditionType.placeholder
admin.products.form.conditionRating.placeholder
admin.products.validation.conditionType
admin.products.validation.conditionRating
marketplace.filter.conditionType
marketplace.filter.minRating
marketplace.filter.conditionType.new
marketplace.filter.conditionType.used
```

## Data Models

### Product Object (from API)

```typescript
interface Product {
  id: number
  name: string
  price: number | null
  description: string
  active: boolean
  conditionType: "NEW" | "USED" | null  // NEW FIELD
  conditionRating: number | null          // NEW FIELD (1-10)
  images: ProductImage[]
  tags: Tag[]
}
```

### API Query Parameters (Marketplace)

```
GET /api/products?page=0&size=20&tagIds=1,2&search=term&conditionType=NEW&conditionRating=5
```

- `conditionType`: optional, filters to exact match
- `conditionRating`: optional, filters to products with rating >= value

### Form Submission Payload (Admin)

```json
{
  "name": "Product Name",
  "price": 29.99,
  "description": "...",
  "active": true,
  "conditionType": "NEW",
  "conditionRating": 8
}
```

### Validation Rules

| Field | Rule | Error Condition |
|-------|------|----------------|
| `conditionType` | Must be `"NEW"` or `"USED"` | Empty/unselected |
| `conditionRating` | Integer, 1 ≤ value ≤ 10 | Empty, non-integer, out of range |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Edit form pre-populates condition fields from product data

*For any* product with a valid `conditionType` ("NEW" or "USED") and a valid `conditionRating` (integer 1–10), when the ProductForm is rendered in edit mode with that product, the conditionType select value SHALL equal the product's conditionType and the conditionRating input value SHALL equal the product's conditionRating.

**Validates: Requirements 1.3**

### Property 2: Form submission payload includes correctly typed condition fields

*For any* valid conditionType ("NEW" or "USED") and valid conditionRating (integer 1–10) entered in the form, when the form is submitted, the JSON payload sent to the API SHALL contain `conditionType` as a string and `conditionRating` as an integer matching the entered values.

**Validates: Requirements 1.4**

### Property 3: Form validation rejects invalid conditionRating values

*For any* numeric value that is not an integer or is outside the range 1–10 (including 0, negative numbers, decimals, and values > 10), when entered as conditionRating and the form is submitted, the form SHALL prevent submission and display a validation error adjacent to the conditionRating field.

**Validates: Requirements 1.5**

### Property 4: Admin table condition cell formatting

*For any* product with a non-null `conditionType` and a non-null `conditionRating`, the products table condition cell SHALL display the localized condition type label followed by `({conditionRating}/10)`. For any product where either field is null/absent, the cell SHALL be empty.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 5: Carousel tag displays localized condition type

*For any* product with a non-null, non-empty `conditionType`, the carousel card tag SHALL display the localized label for that condition type (e.g., "New"/"Used" in the active locale) instead of the index-based rotating tag.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 6: Carousel tag falls back to index-based label when condition is absent

*For any* product where `conditionType` is null, undefined, or an empty string, the carousel card tag SHALL display the existing index-based rotating label from the TAG_KEYS list.

**Validates: Requirements 3.4**

### Property 7: Marketplace condition filters produce correct API parameters

*For any* condition filter selection (conditionType "NEW" or "USED", or minRating 1–10), when the filter is applied, the API request SHALL include the corresponding query parameter (`conditionType` or `conditionRating`) with the selected value, and pagination SHALL be reset to page 0.

**Validates: Requirements 4.2, 4.4**

### Property 8: Product detail displays condition badge and rating

*For any* product with a non-null `conditionType` and `conditionRating`, the product detail view SHALL render a badge with the localized condition type text and display the rating in the format `{conditionRating}/10`. The badge element SHALL have a CSS class that differs based on whether conditionType is "NEW" or "USED".

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 9: Translation key completeness across all locales

*For any* supported locale (es, en, fr, ko), all condition-related translation keys SHALL exist and have non-empty string values, and the set of condition-related keys SHALL be identical across all four locales.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

## Error Handling

| Scenario | Handling |
|----------|----------|
| API returns product without `conditionType`/`conditionRating` | Graceful degradation: carousel uses fallback tag, detail hides condition section, table shows empty cell |
| Admin enters invalid conditionRating | Client-side validation prevents submission; error message shown inline |
| Admin submits form without selecting conditionType | Client-side validation prevents submission; error message shown inline |
| Marketplace API call with condition filters fails | Error message displayed; filter selections preserved for retry |
| API timeout (>10s) on marketplace filter request | AbortController cancels request; error state shown |
| `conditionType` has unexpected value (not "NEW"/"USED") | Treat as absent — use fallback behavior (same as null) |

**Validation approach:** Client-side validation in ProductForm prevents invalid data from reaching the API. The form validates:
- `conditionType` is selected (not empty)
- `conditionRating` is a valid integer between 1 and 10

Server-side validation is assumed to exist in the backend API and will return appropriate error responses if invalid data somehow reaches it.

## Testing Strategy

### Unit Tests (Example-Based)

| Test | Component | What it verifies |
|------|-----------|-----------------|
| Form renders condition fields in create mode | ProductForm | Select and number input exist, empty by default |
| Form shows validation errors for missing fields | ProductForm | Error messages appear when fields are empty on submit |
| Table renders condition column header | ProductsTable | Column exists with localized header |
| Marketplace renders condition filter controls | Marketplace | Filter UI elements exist with correct options |
| Detail hides condition section when data absent | ProductDetail | No condition DOM when conditionType is null |
| Detail applies correct CSS class per type | ProductDetail | `--new` class for NEW, `--used` class for USED |
| Carousel preserves .card-tag structure | Carousel | Tag element exists regardless of condition source |

### Property-Based Tests (fast-check)

The project already uses `fast-check` (v4.6.0) with `vitest` (v4.1.2). Each property test runs a minimum of 100 iterations.

| Property | Test File | Generator Strategy |
|----------|-----------|-------------------|
| Property 1: Edit form pre-population | `ProductForm.property.test.jsx` | Random conditionType from ["NEW","USED"], random integer 1–10 |
| Property 2: Payload correctness | `ProductForm.property.test.jsx` | Random valid type + rating combinations |
| Property 3: Invalid rating rejection | `ProductForm.property.test.jsx` | Random invalid numbers (floats, negatives, 0, >10) |
| Property 4: Table cell formatting | `ProductsTable.property.test.jsx` | Random products with/without condition data |
| Property 5: Carousel condition tag | `Carousel.property.test.jsx` | Random products with valid conditionType |
| Property 6: Carousel fallback tag | `Carousel.property.test.jsx` | Random products with null/undefined/empty conditionType |
| Property 7: Marketplace filter params | `Marketplace.property.test.jsx` | Random filter selections |
| Property 8: Detail condition display | `ProductDetail.property.test.jsx` | Random products with valid condition data |
| Property 9: Translation completeness | `translations.property.test.js` | Iterate all locales, verify key sets |

**Test tagging format:**
```javascript
// Feature: product-condition, Property 1: Edit form pre-populates condition fields from product data
```

**Configuration:**
- Each property test uses `fc.assert(fc.property(...), { numRuns: 100 })`
- Tests use `@testing-library/react` for component rendering
- API calls are mocked with `vi.fn()` to isolate component logic
- Locale context is wrapped with test providers for locale-dependent tests
