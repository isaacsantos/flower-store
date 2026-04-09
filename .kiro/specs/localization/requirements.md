# Requirements Document

## Introduction

This feature adds multi-language support (localization) to the Petal & Bloom React storefront. The app currently renders all UI text in English. After this feature, all visible text across the Navbar, Banner, Carousel, and Footer components will be translatable into four languages: Spanish (default), English, French, and Korean. A language switcher UI element will allow users to change the active language at runtime without a page reload.

## Glossary

- **i18n_System**: The localization subsystem responsible for storing translation strings, tracking the active locale, and providing translated text to components.
- **Language_Switcher**: The UI control rendered in the Navbar that allows users to select their preferred language.
- **Locale**: A language identifier string. Valid values are `es` (Spanish), `en` (English), `fr` (French), `ko` (Korean).
- **Translation_Key**: A unique string identifier used to look up a translated string within a locale's translation map.
- **Translation_Map**: A flat or nested key-value object mapping Translation_Keys to display strings for a given Locale.
- **Active_Locale**: The currently selected Locale whose Translation_Map is used to render UI text.
- **Fallback_Locale**: The Locale used when a Translation_Key is missing from the Active_Locale's Translation_Map. The Fallback_Locale is `es` (Spanish).

---

## Requirements

### Requirement 1: Default Language

**User Story:** As a visitor, I want the store to display in Spanish by default, so that the primary target audience sees content in their language without any action.

#### Acceptance Criteria

1. THE i18n_System SHALL set the Active_Locale to `es` on initial page load.
2. WHEN no previously saved Locale preference exists in browser storage, THE i18n_System SHALL use `es` as the Active_Locale.

---

### Requirement 2: Supported Languages

**User Story:** As a visitor, I want to switch between Spanish, English, French, and Korean, so that I can read the store in my preferred language.

#### Acceptance Criteria

1. THE i18n_System SHALL support exactly four Locales: `es`, `en`, `fr`, and `ko`.
2. THE i18n_System SHALL maintain a Translation_Map for each of the four supported Locales.
3. WHEN a Locale outside the set `{es, en, fr, ko}` is requested, THE i18n_System SHALL retain the current Active_Locale unchanged.

---

### Requirement 3: Language Switcher UI

**User Story:** As a visitor, I want a visible language switcher in the navigation bar, so that I can change the language at any time while browsing.

#### Acceptance Criteria

1. THE Language_Switcher SHALL be rendered inside the Navbar component.
2. THE Language_Switcher SHALL display the four supported Locales as selectable options.
3. WHEN a user selects a Locale from the Language_Switcher, THE i18n_System SHALL update the Active_Locale to the selected value.
4. THE Language_Switcher SHALL visually indicate the currently Active_Locale.
5. WHEN the Active_Locale changes, THE Language_Switcher SHALL reflect the new Active_Locale without a page reload.

---

### Requirement 4: Locale Persistence

**User Story:** As a returning visitor, I want my language preference to be remembered, so that I don't have to re-select my language on every visit.

#### Acceptance Criteria

1. WHEN a user selects a Locale via the Language_Switcher, THE i18n_System SHALL persist the selected Locale to browser localStorage.
2. WHEN the page is loaded and a valid Locale exists in localStorage, THE i18n_System SHALL restore that Locale as the Active_Locale.
3. IF the value stored in localStorage is not a valid Locale, THEN THE i18n_System SHALL fall back to `es` and overwrite the invalid stored value.

---

### Requirement 5: Navbar Translations

**User Story:** As a visitor, I want all Navbar text to appear in my selected language, so that navigation feels native to my language.

#### Acceptance Criteria

1. WHEN the Active_Locale changes, THE Navbar SHALL render the navigation links (Home, Shop, About, Contact) using the Translation_Map for the Active_Locale.
2. WHEN the Active_Locale changes, THE Navbar SHALL render the call-to-action button label using the Translation_Map for the Active_Locale.

---

### Requirement 6: Banner Translations

**User Story:** As a visitor, I want the hero banner text to appear in my selected language, so that the promotional messaging is meaningful to me.

#### Acceptance Criteria

1. WHEN the Active_Locale changes, THE Banner SHALL render the eyebrow text, headline, subheading, and button labels using the Translation_Map for the Active_Locale.

---

### Requirement 7: Carousel Translations

**User Story:** As a visitor, I want all product section text to appear in my selected language, so that I can understand the product listings.

#### Acceptance Criteria

1. WHEN the Active_Locale changes, THE Carousel SHALL render the section eyebrow, section title, section subtitle, product card description, "Quick Add" button label, "Add to Cart" button label, and product tags using the Translation_Map for the Active_Locale.
2. WHEN the Active_Locale changes and products are still loading, THE Carousel SHALL render any loading state text using the Translation_Map for the Active_Locale.
3. IF a product fetch error occurs, THEN THE Carousel SHALL render the error message using the Translation_Map for the Active_Locale.

---

### Requirement 8: Footer Translations

**User Story:** As a visitor, I want the footer text to appear in my selected language, so that the full page experience is consistent.

#### Acceptance Criteria

1. WHEN the Active_Locale changes, THE Footer SHALL render the brand tagline, section headings, navigation link labels, newsletter heading, newsletter description, email input placeholder, and subscribe button label using the Translation_Map for the Active_Locale.
2. WHEN the Active_Locale changes, THE Footer SHALL render the copyright notice using the Translation_Map for the Active_Locale.

---

### Requirement 9: Missing Translation Fallback

**User Story:** As a developer, I want missing translation keys to fall back gracefully, so that the UI never displays a raw key or blank text.

#### Acceptance Criteria

1. IF a Translation_Key is not found in the Active_Locale's Translation_Map, THEN THE i18n_System SHALL return the corresponding string from the Fallback_Locale (`es`) Translation_Map.
2. IF a Translation_Key is not found in the Fallback_Locale's Translation_Map, THEN THE i18n_System SHALL return the Translation_Key string itself as the display value.

---

### Requirement 10: Translation Completeness

**User Story:** As a developer, I want all four Translation_Maps to cover the same set of Translation_Keys, so that no locale produces missing or fallback text in normal use.

#### Acceptance Criteria

1. THE i18n_System SHALL define an identical set of Translation_Keys across all four Translation_Maps.
2. FOR ALL Translation_Keys defined in the `es` Translation_Map, the `en`, `fr`, and `ko` Translation_Maps SHALL each contain a corresponding entry.
