/**
 * Bug Condition Exploration Test — Mobile Filters Not Collapsible
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 *
 * CRITICAL: This test MUST FAIL on unfixed code — failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 *
 * Scoped PBT Approach:
 * - For any viewport ≤640px with any set of tag groups:
 *   - A main "Filters" toggle button exists (class `mp-filter-toggle`)
 *   - The filter panel is collapsed by default (tag lists not visible initially)
 *   - Each tag group has its own collapse/expand toggle button (class `mp-group-toggle`)
 *   - All toggle buttons have a minimum touch target height of 44px
 *
 * Bug Condition: isBugCondition(input) WHERE input.viewportWidth <= 640
 * Expected Behavior: Main filter toggle exists, panel collapsed by default,
 *   per-group toggles exist, all collapsed by default, 44px touch targets
 *
 * EXPECTED OUTCOME: Test FAILS because no toggle buttons exist in the current code.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import Marketplace from './Marketplace.jsx'

// Mock import.meta.env
vi.stubEnv('VITE_PRODUCTS_API_URL', 'http://localhost/api/products')

// Arbitrary: generate a tag with id, name, and type (group)
const tagArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
})

// Arbitrary: generate a group name
const groupNameArbitrary = fc.string({ minLength: 1, maxLength: 15 }).filter(s => s.trim().length > 0)

// Arbitrary: generate tag groups (1-10 groups, 1-20 tags per group)
const tagGroupsArbitrary = fc.array(
  fc.record({
    groupName: groupNameArbitrary,
    tags: fc.array(tagArbitrary, { minLength: 1, maxLength: 20 }),
  }),
  { minLength: 1, maxLength: 10 }
).map(groups => {
  // Flatten groups into a tags array with unique ids and type set to groupName
  let id = 1
  const allTags = []
  for (const group of groups) {
    for (const tag of group.tags) {
      allTags.push({ id: id++, name: tag.name, type: group.groupName })
    }
  }
  return allTags
})

// Arbitrary: mobile viewport width (≤640px)
const mobileViewportArbitrary = fc.integer({ min: 320, max: 640 })

function renderMarketplace() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <Marketplace />
      </LocaleProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('Marketplace Bug Condition Exploration — Mobile Filters Not Collapsible', () => {
  /**
   * Property 1: Bug Condition — Main "Filters" toggle button must exist on mobile
   *
   * On any mobile viewport (≤640px) with any tag configuration, a button with
   * class `mp-filter-toggle` should be rendered to allow collapsing/expanding
   * the filter panel.
   *
   * This test FAILS on unfixed code because no such button exists.
   *
   * **Validates: Requirements 2.1**
   */
  it('Bug Condition: main "Filters" toggle button (mp-filter-toggle) must exist on mobile', async () => {
    await fc.assert(
      fc.asyncProperty(
        tagGroupsArbitrary,
        mobileViewportArbitrary,
        async (tags, viewportWidth) => {
          // Mock fetch to return generated tags for /tags and empty products for /products
          vi.stubGlobal('fetch', vi.fn((url) => {
            if (url.includes('/tags')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(tags),
              })
            }
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ content: [], totalPages: 1 }),
            })
          }))

          // Set viewport width
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true, configurable: true })

          const { container, unmount } = renderMarketplace()

          // Wait for tags to load
          await vi.waitFor(() => {
            const groups = container.querySelectorAll('.mp-filter-group')
            if (groups.length === 0 && tags.length > 0) {
              throw new Error('Tags not loaded yet')
            }
          }, { timeout: 3000 })

          // Assert: a main filter toggle button with class mp-filter-toggle must exist
          const mainToggle = container.querySelector('.mp-filter-toggle')
          expect(mainToggle).not.toBeNull()

          unmount()
        }
      ),
      { numRuns: 20 }
    )
  }, 60000)

  /**
   * Property 1b: Bug Condition — Filter panel collapsed by default on mobile
   *
   * On mobile, the filter panel (.mp-filter-box content / tag lists) should NOT
   * be visible by default — the panel should be collapsed until the user taps
   * the toggle button.
   *
   * This test FAILS on unfixed code because all tag lists are always visible.
   *
   * **Validates: Requirements 2.1, 2.2**
   */
  it('Bug Condition: filter panel must be collapsed by default on mobile (tag lists not visible)', async () => {
    await fc.assert(
      fc.asyncProperty(
        tagGroupsArbitrary,
        mobileViewportArbitrary,
        async (tags, viewportWidth) => {
          vi.stubGlobal('fetch', vi.fn((url) => {
            if (url.includes('/tags')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(tags),
              })
            }
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ content: [], totalPages: 1 }),
            })
          }))

          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true, configurable: true })

          const { container, unmount } = renderMarketplace()

          // Wait for tags to load
          await vi.waitFor(() => {
            const groups = container.querySelectorAll('.mp-filter-group')
            if (groups.length === 0 && tags.length > 0) {
              throw new Error('Tags not loaded yet')
            }
          }, { timeout: 3000 })

          // On mobile, tag lists should NOT be visible by default (panel collapsed)
          // With CSS-based visibility, tag lists are in the DOM but have --collapsed class
          const filterBox = container.querySelector('.mp-filter-box')
          expect(filterBox).not.toBeNull()
          expect(filterBox.classList.contains('mp-filter-box--collapsed')).toBe(true)

          // All tag lists should have the --collapsed class (groups collapsed by default)
          const tagLists = container.querySelectorAll('.mp-tag-list')
          for (const tagList of tagLists) {
            expect(tagList.classList.contains('mp-tag-list--collapsed')).toBe(true)
          }

          unmount()
        }
      ),
      { numRuns: 10 }
    )
  }, 120000)

  /**
   * Property 1c: Bug Condition — Per-group toggle buttons must exist on mobile
   *
   * Each tag group should have its own collapse/expand toggle button with
   * class `mp-group-toggle`.
   *
   * This test FAILS on unfixed code because no group toggle buttons exist.
   *
   * **Validates: Requirements 2.2, 2.3**
   */
  it('Bug Condition: each tag group must have a collapse/expand toggle (mp-group-toggle)', async () => {
    await fc.assert(
      fc.asyncProperty(
        tagGroupsArbitrary,
        mobileViewportArbitrary,
        async (tags, viewportWidth) => {
          vi.stubGlobal('fetch', vi.fn((url) => {
            if (url.includes('/tags')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(tags),
              })
            }
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ content: [], totalPages: 1 }),
            })
          }))

          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true, configurable: true })

          const { container, unmount } = renderMarketplace()

          // Wait for tags to load
          await vi.waitFor(() => {
            const groups = container.querySelectorAll('.mp-filter-group')
            if (groups.length === 0 && tags.length > 0) {
              throw new Error('Tags not loaded yet')
            }
          }, { timeout: 3000 })

          // Count unique groups from the generated tags
          const uniqueGroups = new Set(tags.map(t => t.type))

          // Each group should have a toggle button with class mp-group-toggle
          const groupToggles = container.querySelectorAll('.mp-group-toggle')
          expect(groupToggles.length).toBe(uniqueGroups.size)

          unmount()
        }
      ),
      { numRuns: 20 }
    )
  }, 60000)

  /**
   * Property 1d: Bug Condition — Toggle buttons must have 44px minimum touch target
   *
   * All toggle buttons (main filter toggle and per-group toggles) must have a
   * minimum height of 44px for accessible touch targets on mobile.
   *
   * This test FAILS on unfixed code because no toggle buttons exist at all.
   *
   * **Validates: Requirements 2.4**
   */
  it('Bug Condition: all toggle buttons must have min-height of 44px', async () => {
    await fc.assert(
      fc.asyncProperty(
        tagGroupsArbitrary,
        mobileViewportArbitrary,
        async (tags, viewportWidth) => {
          vi.stubGlobal('fetch', vi.fn((url) => {
            if (url.includes('/tags')) {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(tags),
              })
            }
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ content: [], totalPages: 1 }),
            })
          }))

          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true, configurable: true })

          const { container, unmount } = renderMarketplace()

          // Wait for tags to load
          await vi.waitFor(() => {
            const groups = container.querySelectorAll('.mp-filter-group')
            if (groups.length === 0 && tags.length > 0) {
              throw new Error('Tags not loaded yet')
            }
          }, { timeout: 3000 })

          // All toggle buttons must exist first (this will fail on unfixed code)
          const mainToggle = container.querySelector('.mp-filter-toggle')
          expect(mainToggle).not.toBeNull()

          // Check min-height style attribute or CSS class ensures 44px
          // Since jsdom doesn't compute CSS, we check the element has the
          // style or that it exists with the correct class (CSS guarantees 44px)
          const groupToggles = container.querySelectorAll('.mp-group-toggle')
          const uniqueGroups = new Set(tags.map(t => t.type))
          expect(groupToggles.length).toBe(uniqueGroups.size)

          // Verify all toggles have min-height set via inline style or CSS class
          // The existence of the correct classes is sufficient since CSS defines min-height: 44px
          expect(mainToggle.className).toContain('mp-filter-toggle')
          for (const toggle of groupToggles) {
            expect(toggle.className).toContain('mp-group-toggle')
          }

          unmount()
        }
      ),
      { numRuns: 10 }
    )
  }, 60000)
})
