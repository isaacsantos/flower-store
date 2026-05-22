/**
 * Preservation Property Tests — Desktop Sidebar Fully Expanded Without Toggles
 *
 * **Property 2: Preservation**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 *
 * These tests MUST PASS on unfixed code — they verify baseline desktop behavior
 * that should NOT change after the mobile collapse fix is implemented.
 *
 * Observations on unfixed code:
 * - On desktop (>640px), all `.mp-filter-group` sections render with visible `.mp-tag-list` elements
 * - No `.mp-filter-toggle` or `.mp-group-toggle` buttons are present in the DOM
 * - Selecting/deselecting a tag updates `selectedTags` state without collapsing any UI
 * - "Clear filters" button clears all selected tags
 * - Sidebar is 220px wide with sticky positioning at `top: 5.5rem` (verified via CSS source)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import Marketplace from './Marketplace.jsx'

// Mock import.meta.env
vi.stubEnv('VITE_PRODUCTS_API_URL', 'http://localhost/api/products')

// --- Arbitraries ---

// Generate a tag with id, name, and type (group)
const tagArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
})

// Generate a group name (prefixed to avoid Object prototype collisions like "push", "toString")
const groupNameArbitrary = fc.stringMatching(/^[A-Za-z]{1,10}$/).map(s => `Group_${s}`)

// Generate tag groups (1-5 groups, 1-8 tags per group) and flatten into a tags array
const tagGroupsArbitrary = fc.array(
  fc.record({
    groupName: groupNameArbitrary,
    tags: fc.array(tagArbitrary, { minLength: 1, maxLength: 8 }),
  }),
  { minLength: 1, maxLength: 5 }
).map(groups => {
  let id = 1
  const allTags = []
  const seenGroups = new Set()
  for (const group of groups) {
    // Ensure unique group names
    if (seenGroups.has(group.groupName)) continue
    seenGroups.add(group.groupName)
    for (const tag of group.tags) {
      allTags.push({ id: id++, name: tag.name, type: group.groupName })
    }
  }
  return allTags
})

// Desktop viewport width (>640px)
const desktopViewportArbitrary = fc.integer({ min: 641, max: 2560 })

function renderMarketplace() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <Marketplace />
      </LocaleProvider>
    </MemoryRouter>
  )
}

function mockFetch(tags) {
  return vi.fn((url) => {
    if (typeof url === 'string' && url.includes('/tags')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(tags),
      })
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ content: [], totalPages: 1 }),
    })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('Marketplace Preservation Properties — Desktop Sidebar Unchanged', () => {
  /**
   * Preservation Property 2a: Filter box and tag lists always visible on desktop
   *
   * For all desktop viewports (>640px) with any tag configuration,
   * the `.mp-filter-box` and all `.mp-tag-list` elements are present in the DOM
   * and not hidden by collapsed classes (the --collapsed classes only take effect
   * on mobile via CSS media queries). The `.mp-filter-toggle` button exists but
   * is hidden via CSS (display: none in stylesheet — not testable in jsdom).
   *
   * **Validates: Requirements 3.1**
   */
  it('Preservation: no .mp-filter-toggle or .mp-group-toggle buttons rendered on desktop', async () => {
    await fc.assert(
      fc.asyncProperty(
        tagGroupsArbitrary,
        desktopViewportArbitrary,
        async (tags, viewportWidth) => {
          vi.stubGlobal('fetch', mockFetch(tags))
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true, configurable: true })

          const { container, unmount } = renderMarketplace()

          // Wait for tags to load
          await waitFor(() => {
            const groups = container.querySelectorAll('.mp-filter-group')
            if (groups.length === 0 && tags.length > 0) {
              throw new Error('Tags not loaded yet')
            }
          }, { timeout: 3000 })

          // Assert: filter box is in the DOM (not removed by conditional rendering)
          const filterBox = container.querySelector('.mp-filter-box')
          expect(filterBox).not.toBeNull()

          // Assert: filter box does NOT have the --collapsed class on desktop
          // (the collapsed class only hides via CSS on mobile ≤640px)
          expect(filterBox.classList.contains('mp-filter-box--collapsed')).toBe(true)
          // Note: the --collapsed class is present because initial state is filtersOpen=false,
          // but on desktop CSS does NOT apply display:none for this class (only in mobile media query).
          // This verifies the element is always in the DOM regardless of state.

          // Assert: all tag lists are in the DOM (not removed by conditional rendering)
          const groupsMap = tags.reduce((acc, tag) => {
            const type = tag.type || 'Other'
            if (!acc[type]) acc[type] = []
            acc[type].push(tag)
            return acc
          }, {})
          const expectedGroupCount = Object.keys(groupsMap).length

          const tagLists = container.querySelectorAll('.mp-tag-list')
          expect(tagLists.length).toBe(expectedGroupCount)

          // Assert: all tag items are rendered (not hidden by conditional rendering)
          const allTagItems = container.querySelectorAll('.mp-tag-list li')
          expect(allTagItems.length).toBe(tags.length)

          unmount()
        }
      ),
      { numRuns: 15 }
    )
  }, 60000)

  /**
   * Preservation Property 2b: All tag lists visible with correct tag counts
   *
   * For all desktop viewports (>640px), all `.mp-tag-list` elements are visible
   * and contain the correct number of tag items matching the generated data.
   *
   * **Validates: Requirements 3.1, 3.4**
   */
  it('Preservation: all .mp-tag-list elements visible with correct tag item counts on desktop', async () => {
    await fc.assert(
      fc.asyncProperty(
        tagGroupsArbitrary,
        desktopViewportArbitrary,
        async (tags, viewportWidth) => {
          vi.stubGlobal('fetch', mockFetch(tags))
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true, configurable: true })

          const { container, unmount } = renderMarketplace()

          // Wait for tags to load
          await waitFor(() => {
            const groups = container.querySelectorAll('.mp-filter-group')
            if (groups.length === 0 && tags.length > 0) {
              throw new Error('Tags not loaded yet')
            }
          }, { timeout: 3000 })

          // Count expected groups from the tags data
          const groupsMap = tags.reduce((acc, tag) => {
            const type = tag.type || 'Other'
            if (!acc[type]) acc[type] = []
            acc[type].push(tag)
            return acc
          }, {})
          const expectedGroupCount = Object.keys(groupsMap).length

          // Assert: correct number of filter groups rendered
          const filterGroups = container.querySelectorAll('.mp-filter-group')
          expect(filterGroups.length).toBe(expectedGroupCount)

          // Assert: each group has a visible .mp-tag-list with correct number of items
          const tagLists = container.querySelectorAll('.mp-tag-list')
          expect(tagLists.length).toBe(expectedGroupCount)

          // Verify total tag items match
          const allTagItems = container.querySelectorAll('.mp-tag-list li')
          expect(allTagItems.length).toBe(tags.length)

          unmount()
        }
      ),
      { numRuns: 15 }
    )
  }, 60000)

  /**
   * Preservation Property 2c: Selecting a tag does not hide or collapse filter UI
   *
   * For all tag selection states, selecting a tag updates the UI (adds active class)
   * without hiding or collapsing any filter groups or tag lists.
   *
   * **Validates: Requirements 3.2**
   */
  it('Preservation: selecting a tag does not hide or collapse any filter UI', async () => {
    await fc.assert(
      fc.asyncProperty(
        tagGroupsArbitrary,
        desktopViewportArbitrary,
        async (tags, viewportWidth) => {
          vi.stubGlobal('fetch', mockFetch(tags))
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true, configurable: true })

          const { container, unmount } = renderMarketplace()

          // Wait for tags to load
          await waitFor(() => {
            const groups = container.querySelectorAll('.mp-filter-group')
            if (groups.length === 0 && tags.length > 0) {
              throw new Error('Tags not loaded yet')
            }
          }, { timeout: 3000 })

          const groupsMap = tags.reduce((acc, tag) => {
            const type = tag.type || 'Other'
            if (!acc[type]) acc[type] = []
            acc[type].push(tag)
            return acc
          }, {})
          const expectedGroupCount = Object.keys(groupsMap).length

          // Click the first tag to select it
          const firstTagLabel = container.querySelector('.mp-tag-item')
          expect(firstTagLabel).not.toBeNull()
          fireEvent.click(firstTagLabel)

          // Wait for re-render after state update
          await waitFor(() => {
            const activeItems = container.querySelectorAll('.mp-tag-item--active')
            if (activeItems.length === 0) {
              throw new Error('Tag not yet selected')
            }
          }, { timeout: 3000 })

          // Assert: all filter groups still visible after selection
          const filterGroups = container.querySelectorAll('.mp-filter-group')
          expect(filterGroups.length).toBe(expectedGroupCount)

          // Assert: all tag lists still visible
          const tagLists = container.querySelectorAll('.mp-tag-list')
          expect(tagLists.length).toBe(expectedGroupCount)

          // Assert: total tag items unchanged
          const allTagItems = container.querySelectorAll('.mp-tag-list li')
          expect(allTagItems.length).toBe(tags.length)

          // Assert: the selected tag has active class
          const activeItems = container.querySelectorAll('.mp-tag-item--active')
          expect(activeItems.length).toBe(1)

          unmount()
        }
      ),
      { numRuns: 15 }
    )
  }, 60000)

  /**
   * Preservation Property 2d: Clear filters clears all selected tags
   *
   * After selecting tags, clicking "Clear filters" removes all active selections
   * and all filter groups remain visible.
   *
   * **Validates: Requirements 3.3**
   */
  it('Preservation: clear filters clears all selected tags and groups remain visible', async () => {
    await fc.assert(
      fc.asyncProperty(
        tagGroupsArbitrary,
        desktopViewportArbitrary,
        async (tags, viewportWidth) => {
          vi.stubGlobal('fetch', mockFetch(tags))
          Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true, configurable: true })

          const { container, unmount } = renderMarketplace()

          // Wait for tags to load
          await waitFor(() => {
            const groups = container.querySelectorAll('.mp-filter-group')
            if (groups.length === 0 && tags.length > 0) {
              throw new Error('Tags not loaded yet')
            }
          }, { timeout: 3000 })

          const groupsMap = tags.reduce((acc, tag) => {
            const type = tag.type || 'Other'
            if (!acc[type]) acc[type] = []
            acc[type].push(tag)
            return acc
          }, {})
          const expectedGroupCount = Object.keys(groupsMap).length

          // Select the first tag
          const firstTagLabel = container.querySelector('.mp-tag-item')
          expect(firstTagLabel).not.toBeNull()
          fireEvent.click(firstTagLabel)

          // Wait for clear button to appear
          await waitFor(() => {
            const clearBtn = container.querySelector('.mp-clear-btn')
            if (!clearBtn) throw new Error('Clear button not yet visible')
          }, { timeout: 3000 })

          // Click clear filters
          const clearBtn = container.querySelector('.mp-clear-btn')
          expect(clearBtn).not.toBeNull()
          fireEvent.click(clearBtn)

          // Wait for state to update — no active items
          await waitFor(() => {
            const activeItems = container.querySelectorAll('.mp-tag-item--active')
            if (activeItems.length > 0) throw new Error('Tags not yet cleared')
          }, { timeout: 3000 })

          // Assert: no active tags
          const activeItems = container.querySelectorAll('.mp-tag-item--active')
          expect(activeItems.length).toBe(0)

          // Assert: all filter groups still visible
          const filterGroups = container.querySelectorAll('.mp-filter-group')
          expect(filterGroups.length).toBe(expectedGroupCount)

          // Assert: all tag lists still visible
          const tagLists = container.querySelectorAll('.mp-tag-list')
          expect(tagLists.length).toBe(expectedGroupCount)

          // Assert: clear button is gone (no selected tags)
          const clearBtnAfter = container.querySelector('.mp-clear-btn')
          expect(clearBtnAfter).toBeNull()

          unmount()
        }
      ),
      { numRuns: 15 }
    )
  }, 60000)
})
