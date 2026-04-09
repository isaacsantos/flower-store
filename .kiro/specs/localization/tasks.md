# Implementation Plan: Localization

## Overview

Build a hand-rolled i18n system using React Context and `localStorage`. Create the translation data and context provider first, then wire each component one at a time, and finish with the `LanguageSwitcher` integrated into the Navbar.

## Tasks

- [x] 1. Create translation data and i18n module
  - [x] 1.1 Create `src/i18n/translations.js` with all four locale maps (`es`, `en`, `fr`, `ko`) and every translation key listed in the design
    - Export a single `translations` object and the constants `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `STORAGE_KEY`
    - All four locale maps must contain identical key sets
    - _Requirements: 1.1, 2.1, 2.2, 10.1, 10.2_

  - [x] 1.2 Write property test for identical key sets across all locales (Property 13)
    - **Property 13: All locales share identical key sets**
    - **Validates: Requirements 10.1, 10.2**
    - File: `src/i18n/translations.test.js`

- [x] 2. Implement `LocaleContext` and `useLocale` hook
  - [x] 2.1 Create `src/i18n/LocaleContext.jsx` with `LocaleContext`, `LocaleProvider`, and `useLocale`
    - `LocaleProvider` reads `localStorage["pb_locale"]` on mount; defaults to `'es'` if absent or invalid
    - `setLocale(code)` is a no-op for codes outside `SUPPORTED_LOCALES`; otherwise updates state and writes to `localStorage`
    - `t(key)` implements the three-tier lookup: active locale → `es` fallback → raw key
    - Wrap `localStorage` access in try/catch for private-browsing safety
    - _Requirements: 1.1, 1.2, 2.3, 4.1, 4.2, 4.3, 9.1, 9.2_

  - [x] 2.2 Write property test for default locale (Property 1)
    - **Property 1: Default locale is Spanish**
    - **Validates: Requirements 1.1, 1.2**
    - File: `src/i18n/LocaleContext.test.jsx`

  - [x] 2.3 Write property test for invalid locale rejection (Property 2)
    - **Property 2: Invalid locale is rejected**
    - **Validates: Requirements 2.3**
    - File: `src/i18n/LocaleContext.test.jsx`

  - [x] 2.4 Write property test for `setLocale` updating the active locale (Property 3)
    - **Property 3: setLocale updates the active locale**
    - **Validates: Requirements 3.3**
    - File: `src/i18n/LocaleContext.test.jsx`

  - [x] 2.5 Write property test for `setLocale` persisting to localStorage (Property 5)
    - **Property 5: setLocale persists to localStorage**
    - **Validates: Requirements 4.1**
    - File: `src/i18n/LocaleContext.test.jsx`

  - [x] 2.6 Write property test for locale round-trip from localStorage (Property 6)
    - **Property 6: Locale is restored from localStorage**
    - **Validates: Requirements 4.2**
    - File: `src/i18n/LocaleContext.test.jsx`

  - [x] 2.7 Write property test for `t()` fallback to Spanish (Property 11)
    - **Property 11: Missing key falls back to Spanish**
    - **Validates: Requirements 9.1**
    - File: `src/i18n/LocaleContext.test.jsx`

  - [x] 2.8 Write property test for `t()` returning the key itself when missing from all locales (Property 12)
    - **Property 12: Key missing from all locales returns the key itself**
    - **Validates: Requirements 9.2**
    - File: `src/i18n/LocaleContext.test.jsx`

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Wrap the app in `LocaleProvider` and create `LanguageSwitcher`
  - [x] 4.1 Modify `src/App.jsx` to import `LocaleProvider` and wrap all children in it
    - _Requirements: 1.1, 1.2_

  - [x] 4.2 Create `src/components/LanguageSwitcher.jsx` and `LanguageSwitcher.css`
    - Render a `<select>` with one `<option>` per supported locale
    - Read `locale` and call `setLocale` via `useLocale()`
    - No props required
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Write property test for `LanguageSwitcher` reflecting the active locale (Property 4)
    - **Property 4: Language switcher reflects the active locale**
    - **Validates: Requirements 3.4, 3.5**
    - File: `src/components/Navbar.test.jsx`

  - [x] 4.4 Write unit tests for `LanguageSwitcher` inside Navbar
    - Verify `LanguageSwitcher` is rendered inside `Navbar`
    - Verify exactly four `<option>` elements are rendered
    - _Requirements: 3.1, 3.2_
    - File: `src/components/Navbar.test.jsx`

- [x] 5. Translate Navbar
  - [x] 5.1 Modify `src/components/Navbar.jsx` to call `useLocale()` and replace all hardcoded strings with `t()` calls, and render `<LanguageSwitcher />`
    - Keys: `nav.home`, `nav.shop`, `nav.about`, `nav.contact`, `nav.cta`
    - _Requirements: 5.1, 5.2_

  - [x] 5.2 Write property test for Navbar rendering text from the active locale (Property 7)
    - **Property 7: Navbar renders all text from the active locale**
    - **Validates: Requirements 5.1, 5.2**
    - File: `src/components/Navbar.test.jsx`

- [x] 6. Translate Banner
  - [x] 6.1 Modify `src/components/Banner.jsx` to call `useLocale()` and replace all hardcoded strings with `t()` calls
    - Keys: `banner.eyebrow`, `banner.title`, `banner.title.accent`, `banner.sub`, `banner.cta.primary`, `banner.cta.ghost`
    - _Requirements: 6.1_

  - [x] 6.2 Write property test for Banner rendering text from the active locale (Property 8)
    - **Property 8: Banner renders all text from the active locale**
    - **Validates: Requirements 6.1**
    - File: `src/components/Banner.test.jsx`

- [x] 7. Translate Carousel
  - [x] 7.1 Modify `src/components/Carousel.jsx` to call `useLocale()` and replace all hardcoded strings with `t()` calls
    - Section keys: `carousel.eyebrow`, `carousel.title`, `carousel.sub`
    - Card keys: `carousel.card.desc`, `carousel.card.quickAdd`, `carousel.card.addToCart`
    - Tag keys: `carousel.tag.bestseller`, `carousel.tag.new`, `carousel.tag.limited`, `carousel.tag.popular`, `carousel.tag.fresh`, `carousel.tag.seasonal`
    - State keys: `carousel.loading`, `carousel.error`
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 7.2 Write property test for Carousel rendering text from the active locale (Property 9)
    - **Property 9: Carousel renders all text from the active locale**
    - **Validates: Requirements 7.1, 7.2, 7.3**
    - File: `src/components/Carousel.test.jsx`

- [x] 8. Translate Footer
  - [x] 8.1 Modify `src/components/Footer.jsx` to call `useLocale()` and replace all hardcoded strings with `t()` calls
    - Keys: `footer.tagline`, `footer.shop.heading`, `footer.shop.bouquets`, `footer.shop.seasonal`, `footer.shop.gifts`, `footer.shop.subscriptions`, `footer.help.heading`, `footer.help.faq`, `footer.help.delivery`, `footer.help.returns`, `footer.help.contact`, `footer.newsletter.heading`, `footer.newsletter.desc`, `footer.newsletter.placeholder`, `footer.newsletter.btn`, `footer.copyright`
    - _Requirements: 8.1, 8.2_

  - [x] 8.2 Write property test for Footer rendering text from the active locale (Property 10)
    - **Property 10: Footer renders all text from the active locale**
    - **Validates: Requirements 8.1, 8.2**
    - File: `src/components/Footer.test.jsx`

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations; run from `flower-store/` with `npx vitest --run`
- Each property test file must include a comment in the format: `// Feature: localization, Property N: <title>`
- `localStorage` access must be wrapped in try/catch to handle private-browsing environments
