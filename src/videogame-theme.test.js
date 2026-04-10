import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import * as fc from 'fast-check'
import { translations } from './i18n/translations.js'

const ROOT = resolve(__dirname, '..')
const SRC = resolve(__dirname)

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Files that are preserved (backend/admin) and should NOT be checked
 * for floral color/font removal — they were intentionally left unchanged.
 */
const PRESERVED_FILE_PREFIXES = [
  'Admin', 'ProductForm', 'ProductsTable', 'BranchPickerModal',
]

function isPreservedFile(name) {
  return PRESERVED_FILE_PREFIXES.some(p => name.startsWith(p))
}

/** Collect all .css files under src/, optionally excluding preserved admin/backend files */
function getCssFiles({ excludePreserved = false } = {}) {
  const files = []
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full)
      else if (entry.isFile() && entry.name.endsWith('.css')) {
        if (excludePreserved && isPreservedFile(entry.name)) continue
        files.push(full)
      }
    }
  }
  walk(SRC)
  return files
}

/** Get all public (non-admin) translation keys for a locale */
function getPublicKeys(locale) {
  const all = Object.keys(translations[locale] || {})
  return all.filter(k => !k.startsWith('admin.'))
}

// ─── Property 1: No floral colors in CSS files ────────────────────────────────

describe('Feature: videogame-store-theme, Property 1: No floral colors in CSS', () => {
  /**
   * **Validates: Requirements 1.3, 1.4**
   *
   * For any CSS file in src/ (excluding Admin* files), none of the original
   * floral hardcoded colors should be present.
   */
  const FLORAL_COLORS = [
    '#e11d48', '#f472b6', '#fff0f6', '#fce7f3',
    '#1a0a0f', '#6b3a4a', '#f9a8d4', '#f0d6e4',
    '#fff7f0', '#fff0f8',
  ]

  const cssFiles = getCssFiles({ excludePreserved: true })

  it('no CSS file (excluding Admin) contains floral hardcoded colors (100+ runs)', () => {
    const arb = fc.constantFrom(...cssFiles)

    fc.assert(
      fc.property(arb, (filePath) => {
        const content = readFileSync(filePath, 'utf-8').toLowerCase()
        for (const color of FLORAL_COLORS) {
          if (content.includes(color.toLowerCase())) {
            return false
          }
        }
        return true
      }),
      { numRuns: Math.max(100, cssFiles.length * 10) },
    )
  })
})

// ─── Property 2: No floral font in CSS files ──────────────────────────────────

describe('Feature: videogame-store-theme, Property 2: No floral font in CSS', () => {
  /**
   * **Validates: Requirement 2.3**
   *
   * For any CSS file in src/, the string "Playfair Display" must not be present.
   */
  const allCssFiles = getCssFiles({ excludePreserved: true })

  it('no CSS file contains "Playfair Display" (100+ runs)', () => {
    const arb = fc.constantFrom(...allCssFiles)

    fc.assert(
      fc.property(arb, (filePath) => {
        const content = readFileSync(filePath, 'utf-8')
        return !content.includes('Playfair Display')
      }),
      { numRuns: Math.max(100, allCssFiles.length * 10) },
    )
  })
})

// ─── Property 3: No floral text in public translations ────────────────────────

describe('Feature: videogame-store-theme, Property 3: No floral text in public translations', () => {
  /**
   * **Validates: Requirements 3.1, 3.2**
   *
   * For any locale and any public key, the value must not contain floral words
   * or old brand names.
   */
  const LOCALES = Object.keys(translations)
  const FLORAL_WORDS = [
    'flor', 'ramo', 'pétalo', 'bouquet', 'bloom', 'petal',
    'garden', 'jardín', '꽃', '부케', 'fleur',
  ]
  const OLD_BRANDS = ['el jardin de casa blanca', 'petal & bloom']

  // Build a flat list of [locale, key] pairs for public keys
  const localeKeyPairs = []
  for (const locale of LOCALES) {
    for (const key of getPublicKeys(locale)) {
      localeKeyPairs.push([locale, key])
    }
  }

  it('no public translation value contains floral words or old brand names (100+ runs)', () => {
    const arb = fc.constantFrom(...localeKeyPairs)

    fc.assert(
      fc.property(arb, ([locale, key]) => {
        const value = (translations[locale][key] || '').toLowerCase()

        // Check old brand names
        for (const brand of OLD_BRANDS) {
          if (value.includes(brand)) return false
        }

        // Check floral words — "rose" needs standalone word check
        for (const word of FLORAL_WORDS) {
          if (value.includes(word)) return false
        }

        // Check "rose" as standalone word (not part of "arrose", etc.)
        // Match \brose\b but in a simple way
        if (/\brose\b/i.test(value) && !/\broses?\b/i.test(key)) {
          // "rose" as standalone word in value (not "arrose")
          // Actually let's use a proper regex
        }
        const roseRegex = /\broses?\b/i
        if (roseRegex.test(value)) return false

        return true
      }),
      { numRuns: Math.max(100, localeKeyPairs.length * 2) },
    )
  })
})

// ─── Property 4: Translation key consistency across locales ────────────────────

describe('Feature: videogame-store-theme, Property 4: Translation key consistency across locales', () => {
  /**
   * **Validates: Requirement 3.10**
   *
   * For any pair of locales, their key sets must be identical.
   */
  const LOCALES = Object.keys(translations)

  // Build all pairs of locales
  const localePairs = []
  for (let i = 0; i < LOCALES.length; i++) {
    for (let j = i + 1; j < LOCALES.length; j++) {
      localePairs.push([LOCALES[i], LOCALES[j]])
    }
  }

  it('every pair of locales has identical key sets (100+ runs)', () => {
    const arb = fc.constantFrom(...localePairs)

    fc.assert(
      fc.property(arb, ([localeA, localeB]) => {
        const keysA = new Set(Object.keys(translations[localeA]))
        const keysB = new Set(Object.keys(translations[localeB]))

        if (keysA.size !== keysB.size) return false

        for (const k of keysA) {
          if (!keysB.has(k)) return false
        }
        return true
      }),
      { numRuns: 100 },
    )
  })
})

// ─── Property 5: Backend/admin file preservation ──────────────────────────────

describe('Feature: videogame-store-theme, Property 5: Backend/admin file preservation', () => {
  /**
   * **Validates: Requirements 14.1, 14.3, 14.4**
   *
   * Backend and admin files must exist and not have been modified.
   * We verify they exist and contain expected patterns (imports, class names, etc.)
   */
  const BACKEND_ADMIN_FILES = [
    'src/firebase/AuthContext.jsx',
    'src/firebase/firebaseConfig.js',
    'src/utils/apiClient.js',
    'src/utils/nearestBranch.js',
    'src/components/AdminAuthGuard.jsx',
    'src/components/AdminHome.jsx',
    'src/components/AdminHome.css',
    'src/components/AdminLayout.jsx',
    'src/components/AdminLayout.css',
    'src/components/AdminLogin.jsx',
    'src/components/AdminLogin.css',
    'src/components/AdminSidebar.jsx',
    'src/components/AdminSidebar.css',
    'src/components/ProductForm.jsx',
    'src/components/ProductForm.css',
    'src/components/ProductsTable.jsx',
    'src/components/ProductsTable.css',
    'src/components/BranchPickerModal.jsx',
    'src/components/BranchPickerModal.css',
  ]

  // Expected content patterns per file (substring that must exist)
  const EXPECTED_PATTERNS = {
    'src/firebase/AuthContext.jsx': 'AuthProvider',
    'src/firebase/firebaseConfig.js': 'firebase',
    'src/utils/apiClient.js': 'fetch',
    'src/utils/nearestBranch.js': 'Branch',
    'src/components/AdminAuthGuard.jsx': 'AdminAuthGuard',
    'src/components/AdminHome.jsx': 'AdminHome',
    'src/components/AdminHome.css': 'admin',
    'src/components/AdminLayout.jsx': 'AdminLayout',
    'src/components/AdminLayout.css': 'admin',
    'src/components/AdminLogin.jsx': 'AdminLogin',
    'src/components/AdminLogin.css': 'admin',
    'src/components/AdminSidebar.jsx': 'AdminSidebar',
    'src/components/AdminSidebar.css': 'admin',
    'src/components/ProductForm.jsx': 'ProductForm',
    'src/components/ProductForm.css': 'admin-form',
    'src/components/ProductsTable.jsx': 'ProductsTable',
    'src/components/ProductsTable.css': 'admin-products-table',
    'src/components/BranchPickerModal.jsx': 'BranchPickerModal',
    'src/components/BranchPickerModal.css': 'bpm-modal',
  }

  it('all backend/admin files exist and contain expected patterns (100+ runs)', () => {
    const arb = fc.constantFrom(...BACKEND_ADMIN_FILES)

    fc.assert(
      fc.property(arb, (relPath) => {
        const fullPath = resolve(ROOT, relPath)

        // File must exist
        if (!existsSync(fullPath)) return false

        const content = readFileSync(fullPath, 'utf-8')

        // File must not be empty
        if (content.trim().length === 0) return false

        // File must contain expected pattern
        const pattern = EXPECTED_PATTERNS[relPath]
        if (pattern && !content.toLowerCase().includes(pattern.toLowerCase())) {
          return false
        }

        return true
      }),
      { numRuns: Math.max(100, BACKEND_ADMIN_FILES.length * 10) },
    )
  })
})


// ─── Unit Tests ────────────────────────────────────────────────────────────────

describe('Unit tests: videogame-store-theme', () => {
  /** **Validates: Requirements 1.1, 2.1** */
  describe('index.css', () => {
    const css = readFileSync(resolve(SRC, 'index.css'), 'utf-8')

    it('imports Orbitron and Exo 2 from Google Fonts', () => {
      expect(css).toContain('Orbitron')
      expect(css).toContain('Exo+2')
    })

    it('defines :root variables with gaming palette values', () => {
      expect(css).toContain('--pink')
      expect(css).toContain('--rose')
      expect(css).toContain('--green')
      expect(css).toContain('--dark')
      expect(css).toContain('--cream')
      expect(css).toContain('--gold')
      // Gaming palette values
      expect(css).toContain('#a855f7')
      expect(css).toContain('#00d4ff')
      expect(css).toContain('#39ff14')
      expect(css).toContain('#0a0e1a')
      expect(css).toContain('#0f1328')
      expect(css).toContain('#ffd700')
    })

    it('sets Exo 2 as body font and Orbitron for headings', () => {
      expect(css).toMatch(/body\s*\{[^}]*'Exo 2'/s)
      expect(css).toMatch(/h1,\s*h2,\s*h3\s*\{[^}]*'Orbitron'/s)
    })
  })

  /** **Validates: Requirement 13.1** */
  describe('index.html', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf-8')

    it('contains <title> with "Pixel Realm"', () => {
      expect(html).toMatch(/<title>.*Pixel Realm.*<\/title>/)
    })
  })

  /** **Validates: Requirements 4.1, 3.2** */
  describe('Banner.jsx', () => {
    const jsx = readFileSync(resolve(SRC, 'components', 'Banner.jsx'), 'utf-8')

    it('contains gaming emojis', () => {
      expect(jsx).toContain('🎮')
      expect(jsx).toContain('🕹️')
      expect(jsx).toContain('👾')
      expect(jsx).toContain('🏆')
      expect(jsx).toContain('⚡')
      expect(jsx).toContain('🎯')
    })

    it('does not contain floral emojis', () => {
      expect(jsx).not.toContain('🌸')
      expect(jsx).not.toContain('🌺')
      expect(jsx).not.toContain('🌼')
      expect(jsx).not.toContain('🌷')
      expect(jsx).not.toContain('🌹')
      expect(jsx).not.toContain('💐')
    })
  })

  /** **Validates: Requirement 7.1** */
  describe('Navbar.jsx', () => {
    const jsx = readFileSync(resolve(SRC, 'components', 'Navbar.jsx'), 'utf-8')

    it('contains "Pixel Realm" as logo text', () => {
      expect(jsx).toContain('Pixel Realm')
    })
  })

  /** **Validates: Requirement 8.1** */
  describe('Footer.jsx', () => {
    const jsx = readFileSync(resolve(SRC, 'components', 'Footer.jsx'), 'utf-8')

    it('contains "🎮 Pixel Realm"', () => {
      expect(jsx).toContain('🎮 Pixel Realm')
    })
  })

  /** **Validates: Requirement 9.2** */
  describe('Marketplace.jsx', () => {
    const jsx = readFileSync(resolve(SRC, 'components', 'Marketplace.jsx'), 'utf-8')

    it('contains gaming emojis', () => {
      expect(jsx).toContain('🎮')
      expect(jsx).toContain('🕹️')
      expect(jsx).toContain('👾')
    })
  })

  /** **Validates: Requirement 11.1** */
  describe('NotFound.jsx', () => {
    const jsx = readFileSync(resolve(SRC, 'components', 'NotFound.jsx'), 'utf-8')

    it('contains gaming emojis', () => {
      expect(jsx).toContain('🎮')
      expect(jsx).toContain('🕹️')
      expect(jsx).toContain('👾')
    })
  })

  /** **Validates: Requirement 12.1** */
  describe('Contact.jsx', () => {
    const jsx = readFileSync(resolve(SRC, 'components', 'Contact.jsx'), 'utf-8')

    it('contains gaming emojis', () => {
      expect(jsx).toContain('🎮')
      expect(jsx).toContain('🕹️')
      expect(jsx).toContain('👾')
    })
  })

  /** **Validates: Requirement 14.2** */
  describe('App.jsx preserves routes', () => {
    const jsx = readFileSync(resolve(SRC, 'App.jsx'), 'utf-8')

    it('has route for /', () => {
      expect(jsx).toMatch(/path=["']\/["']/)
    })

    it('has route for /shop', () => {
      expect(jsx).toMatch(/path=["']\/shop["']/)
    })

    it('has route for /product/:id', () => {
      expect(jsx).toMatch(/path=["']\/product\/:id["']/)
    })

    it('has route for /contact', () => {
      expect(jsx).toMatch(/path=["']\/contact["']/)
    })

    it('has route for /admin', () => {
      expect(jsx).toMatch(/path=["']\/admin["']/)
    })

    it('has wildcard route for *', () => {
      expect(jsx).toMatch(/path=["']\*["']/)
    })
  })
})
