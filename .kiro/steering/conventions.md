# Development Conventions

## i18n — All user-visible text must be translated

Every string rendered in the UI must go through the `t()` function from `useLocale()`. Never hardcode display text directly in JSX.

**Adding new text:**
1. Add the key and its value to all four locale maps in `src/i18n/translations.js` — `es`, `en`, `fr`, `ko` must always have identical key sets.
2. Use `t('your.key')` in the component.
3. Use dot-notation keys scoped to the component (e.g. `navbar.newItem`, `footer.newSection`).

```jsx
// ✅ correct
const { t } = useLocale()
<p>{t('banner.newTagline')}</p>

// ❌ wrong
<p>New tagline here</p>
```

## Responsive design — All UI changes must work on mobile, tablet, and desktop

Every new component or UI modification must include responsive CSS. The breakpoints used across the project are:

| Breakpoint | Target |
|---|---|
| ≤ 640px | Mobile |
| ≤ 900px | Tablet |
| > 900px | Desktop (base styles) |

**Rules:**
- Write base styles for desktop, then add `@media (max-width: 900px)` and `@media (max-width: 640px)` overrides as needed.
- Never use fixed pixel widths for layout containers — use `flex`, `grid`, `%`, `clamp()`, or `max-width` with `width: 100%`.
- Touch targets (buttons, links) must be at least 44px tall on mobile.
- Test any new layout at 375px (mobile), 768px (tablet), and 1280px (desktop) widths.

```css
/* ✅ correct pattern */
.my-component {
  display: flex;
  gap: 2rem;
  padding: 4rem 5rem;
}

@media (max-width: 900px) {
  .my-component { padding: 3rem 2rem; }
}

@media (max-width: 640px) {
  .my-component {
    flex-direction: column;
    padding: 2rem 1.25rem;
  }
}
```
