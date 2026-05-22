# Bugfix Requirements Document

## Introduction

The Admin ProductsTable component has two issues on mobile viewports (≤640px): (1) the card-view layout still causes horizontal scrolling because the table's `min-width: 900px` is never removed in the mobile media query, and (2) there is no quick toggle button to enable/disable a product's active status directly from the table row — users must open the full edit form.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the viewport width is ≤640px THEN the system still renders the products table with `min-width: 900px`, causing horizontal overflow despite the card-view CSS being applied

1.2 WHEN a user views the products table at any viewport width THEN the system only displays a read-only active/inactive badge with no way to toggle the product's active status without opening the edit form

### Expected Behavior (Correct)

2.1 WHEN the viewport width is ≤640px THEN the system SHALL remove the `min-width` constraint on the table so that the card-view layout fits within the viewport without horizontal scrolling

2.2 WHEN a user views the products table THEN the system SHALL display a toggle button in each row that allows quickly enabling or disabling the product's active status via an API call, with the button having a minimum touch target of 44px on mobile

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the viewport width is >640px THEN the system SHALL CONTINUE TO render the products table in its standard horizontal table layout with `min-width: 900px` and horizontal scroll when needed

3.2 WHEN a user clicks the edit button THEN the system SHALL CONTINUE TO open the product edit form as before

3.3 WHEN a user clicks the delete button THEN the system SHALL CONTINUE TO prompt for confirmation and delete the product as before

3.4 WHEN the viewport width is ≤640px THEN the system SHALL CONTINUE TO display each table row as a card with labeled fields using `data-label` attributes
