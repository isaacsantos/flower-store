import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import * as fc from 'fast-check'

/* ── Mocks ─────────────────────────────────────────────────────────── */

vi.mock('../firebase/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { getIdToken: () => 'token' } }),
}))

vi.mock('../i18n/LocaleContext.jsx', () => ({
  useLocale: () => ({
    t: (key) => {
      if (key === 'admin.ai.counter') return '{count} / {max}'
      if (key === 'admin.ai.error.limit') return 'No puedes agregar más de {max} archivos'
      return key
    },
    locale: 'es',
  }),
}))

vi.mock('../utils/apiClient.js', () => ({
  apiUploadRaw: vi.fn(),
  ADMIN_API_URL: 'http://localhost/admin/api/products',
}))

import { apiUploadRaw } from '../utils/apiClient.js'
import AiProductModal from './AiProductModal.jsx'

/* ── Helpers ───────────────────────────────────────────────────────── */

function makeImageFile(name = 'photo.png', mime = 'image/png') {
  return new File(['x'], name, { type: mime })
}

function getDropzone() {
  return screen.getByText('admin.ai.dropzone').closest('.ai-modal-dropzone')
}

function getFileInput() {
  return document.querySelector('input[type="file"]')
}

let blobCounter = 0

/* ── Setup / Teardown ──────────────────────────────────────────────── */

beforeEach(() => {
  blobCounter = 0
  vi.stubGlobal('URL', {
    ...globalThis.URL,
    createObjectURL: vi.fn(() => `blob:mock-${++blobCounter}`),
    revokeObjectURL: vi.fn(),
  })
  apiUploadRaw.mockReset()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

/* ══════════════════════════════════════════════════════════════════════
   PROPERTY-BASED TESTS
   ══════════════════════════════════════════════════════════════════════ */

// Feature: ai-product-creation, Property 2: Filtro exclusivo de imágenes
// **Validates: Requirements 2.5**
describe('Property 2: Filtro exclusivo de imágenes', () => {
  const nonImageMimeArb = fc.stringMatching(/^[a-z]+\/[a-z0-9.+-]+$/).filter(
    (m) => !m.startsWith('image/')
  )
  const imageSubtypeArb = fc.stringMatching(/^[a-z0-9.+-]+$/).map((s) => `image/${s}`)

  it('rejects any file whose MIME type does not start with image/', () => {
    fc.assert(
      fc.property(nonImageMimeArb, (mime) => {
        cleanup()
        render(<AiProductModal onClose={vi.fn()} />)
        const input = getFileInput()
        const file = new File(['x'], 'file.bin', { type: mime })
        fireEvent.change(input, { target: { files: [file] } })
        expect(screen.getByText(/0 \/ /)).toBeTruthy()
        cleanup()
      }),
      { numRuns: 100 },
    )
  }, 30000)

  it('accepts any file whose MIME type starts with image/ (within limit)', () => {
    fc.assert(
      fc.property(imageSubtypeArb, (mime) => {
        cleanup()
        render(<AiProductModal onClose={vi.fn()} />)
        const input = getFileInput()
        const file = new File(['x'], 'img.dat', { type: mime })
        fireEvent.change(input, { target: { files: [file] } })
        expect(screen.getByText(/1 \/ /)).toBeTruthy()
        cleanup()
      }),
      { numRuns: 100 },
    )
  }, 30000)
})

// Feature: ai-product-creation, Property 3: Invariante de lista de archivos y previews
// **Validates: Requirements 2.7, 2.8**
describe('Property 3: Invariante de lista de archivos y previews', () => {
  it('preview count always equals file count after add/remove operations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (addCount, removeIdx) => {
          cleanup()
          render(<AiProductModal onClose={vi.fn()} />)
          const input = getFileInput()

          const files = Array.from({ length: addCount }, (_, i) =>
            new File(['x'], `img${i}.png`, { type: 'image/png' }),
          )
          fireEvent.change(input, { target: { files } })

          const thumbs = document.querySelectorAll('.ai-modal-thumb')
          expect(thumbs.length).toBe(addCount)

          if (addCount > 0) {
            const validIdx = removeIdx % addCount
            const removeButtons = document.querySelectorAll('.ai-modal-thumb-remove')
            fireEvent.click(removeButtons[validIdx])

            const thumbsAfter = document.querySelectorAll('.ai-modal-thumb')
            expect(thumbsAfter.length).toBe(addCount - 1)
          }

          cleanup()
        },
      ),
      { numRuns: 100 },
    )
  }, 30000)
})

// Feature: ai-product-creation, Property 4: Cumplimiento del límite de archivos
// **Validates: Requirements 3.3, 3.4**
describe('Property 4: Cumplimiento del límite de archivos', () => {
  const MAX_FILES = 10

  it('when C+M > MAX_FILES, only MAX_FILES-C files are accepted and error is shown', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_FILES - 1 }),
        fc.integer({ min: 1, max: 20 }),
        (currentCount, addCount) => {
          cleanup()
          render(<AiProductModal onClose={vi.fn()} />)
          const input = getFileInput()

          if (currentCount > 0) {
            const initial = Array.from({ length: currentCount }, (_, i) =>
              new File(['x'], `init${i}.png`, { type: 'image/png' }),
            )
            fireEvent.change(input, { target: { files: initial } })
          }

          const extra = Array.from({ length: addCount }, (_, i) =>
            new File(['x'], `extra${i}.png`, { type: 'image/png' }),
          )
          fireEvent.change(input, { target: { files: extra } })

          const thumbs = document.querySelectorAll('.ai-modal-thumb')
          const expectedTotal = Math.min(currentCount + addCount, MAX_FILES)
          expect(thumbs.length).toBe(expectedTotal)

          if (currentCount + addCount > MAX_FILES) {
            expect(screen.getByText(`No puedes agregar más de ${MAX_FILES} archivos`)).toBeTruthy()
          }

          cleanup()
        },
      ),
      { numRuns: 100 },
    )
  }, 30000)

  it('when files.length === MAX_FILES, the dropzone is disabled', () => {
    render(<AiProductModal onClose={vi.fn()} />)
    const input = getFileInput()

    const files = Array.from({ length: MAX_FILES }, (_, i) =>
      new File(['x'], `img${i}.png`, { type: 'image/png' }),
    )
    fireEvent.change(input, { target: { files } })

    const dropzone = document.querySelector('.ai-modal-dropzone')
    expect(dropzone.classList.contains('ai-modal-dropzone--disabled')).toBe(true)
  })
})

// Feature: ai-product-creation, Property 5: Precisión del contador de archivos
// **Validates: Requirement 3.5**
describe('Property 5: Precisión del contador de archivos', () => {
  const MAX_FILES = 10

  it('counter shows exactly "{N} / {M}" for any file count N', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_FILES }),
        (n) => {
          cleanup()
          render(<AiProductModal onClose={vi.fn()} />)
          const input = getFileInput()

          if (n > 0) {
            const files = Array.from({ length: n }, (_, i) =>
              new File(['x'], `img${i}.png`, { type: 'image/png' }),
            )
            fireEvent.change(input, { target: { files } })
          }

          const counter = document.querySelector('.ai-modal-counter')
          expect(counter).toBeTruthy()
          expect(counter.textContent).toBe(`${n} / ${MAX_FILES}`)

          cleanup()
        },
      ),
      { numRuns: 100 },
    )
  }, 30000)
})

// Feature: ai-product-creation, Property 6: Construcción correcta de FormData
// **Validates: Requirement 4.1**
describe('Property 6: Construcción correcta de FormData', () => {
  it('FormData contains exactly N entries all with key "files"', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (n) => {
          cleanup()
          let capturedFormData = null
          apiUploadRaw.mockImplementation((_url, formData) => {
            capturedFormData = formData
            return Promise.resolve({ status: 202 })
          })

          render(<AiProductModal onClose={vi.fn()} />)
          const input = getFileInput()

          const files = Array.from({ length: n }, (_, i) =>
            new File(['x'], `img${i}.png`, { type: 'image/png' }),
          )
          fireEvent.change(input, { target: { files } })

          const sendBtn = screen.getByText('admin.ai.send')
          await act(async () => {
            fireEvent.click(sendBtn)
          })

          expect(capturedFormData).toBeTruthy()
          const entries = capturedFormData.getAll('files')
          expect(entries.length).toBe(n)

          cleanup()
        },
      ),
      { numRuns: 100 },
    )
  }, 30000)
})

// Feature: ai-product-creation, Property 7: Botón de envío deshabilitado sin archivos
// **Validates: Requirement 4.5**
describe('Property 7: Botón de envío deshabilitado sin archivos', () => {
  it('send button is disabled when file list is empty', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          cleanup()
          render(<AiProductModal onClose={vi.fn()} />)
          const sendBtn = screen.getByText('admin.ai.send')
          expect(sendBtn.disabled).toBe(true)
          cleanup()
        },
      ),
      { numRuns: 100 },
    )
  }, 30000)
})

// Feature: ai-product-creation, Property 8: Respuesta no-202 muestra error
// **Validates: Requirement 5.2**
describe('Property 8: Respuesta no-202 muestra error', () => {
  const nonSuccessStatusArb = fc.integer({ min: 100, max: 599 }).filter((s) => s !== 202)

  it('for any HTTP status != 202, modal shows error and not success', async () => {
    await fc.assert(
      fc.asyncProperty(nonSuccessStatusArb, async (status) => {
        cleanup()
        apiUploadRaw.mockResolvedValue({ status })

        render(<AiProductModal onClose={vi.fn()} />)
        const input = getFileInput()

        const file = new File(['x'], 'img.png', { type: 'image/png' })
        fireEvent.change(input, { target: { files: [file] } })

        const sendBtn = screen.getByText('admin.ai.send')
        await act(async () => {
          fireEvent.click(sendBtn)
        })

        expect(screen.getByText('admin.ai.error.send')).toBeTruthy()
        expect(screen.queryByText('admin.ai.success')).toBeNull()

        cleanup()
      }),
      { numRuns: 100 },
    )
  }, 30000)
})

/* ══════════════════════════════════════════════════════════════════════
   UNIT TESTS
   ══════════════════════════════════════════════════════════════════════ */

describe('AiProductModal — Unit Tests', () => {
  // Req 2.1: ARIA attributes role="dialog" and aria-modal="true"
  it('renders with role="dialog" and aria-modal="true"', () => {
    render(<AiProductModal onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  // Req 2.2: Close button visible and functional
  it('shows a close button that calls onClose', () => {
    const onClose = vi.fn()
    render(<AiProductModal onClose={onClose} />)
    const closeBtn = screen.getByText('admin.ai.close')
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Req 2.3: Drag-and-drop adds image files
  it('adds image files via drag-and-drop', () => {
    render(<AiProductModal onClose={vi.fn()} />)
    const dropzone = getDropzone()
    const file = makeImageFile('photo.jpg', 'image/jpeg')

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    })

    expect(document.querySelectorAll('.ai-modal-thumb').length).toBe(1)
  })

  // Req 2.4: File selector adds files
  it('adds files via the file input selector', () => {
    render(<AiProductModal onClose={vi.fn()} />)
    const input = getFileInput()
    const file = makeImageFile('pic.png', 'image/png')

    fireEvent.change(input, { target: { files: [file] } })

    expect(document.querySelectorAll('.ai-modal-thumb').length).toBe(1)
  })

  // Req 2.6: Visual indication during drag-over
  it('shows visual indication during drag-over', () => {
    render(<AiProductModal onClose={vi.fn()} />)
    const dropzone = getDropzone()

    fireEvent.dragOver(dropzone, {
      dataTransfer: { files: [] },
    })

    expect(dropzone.classList.contains('ai-modal-dropzone--active')).toBe(true)

    fireEvent.dragLeave(dropzone, {
      dataTransfer: { files: [] },
    })

    expect(dropzone.classList.contains('ai-modal-dropzone--active')).toBe(false)
  })

  // Req 3.1, 3.2: Reading VITE_AI_MAX_FILES and default 10
  it('uses default MAX_FILES of 10 when env var is not set', () => {
    render(<AiProductModal onClose={vi.fn()} />)
    const counter = document.querySelector('.ai-modal-counter')
    expect(counter.textContent).toBe('0 / 10')
  })

  // Req 4.3, 4.4: Loading indicator and disabled buttons during send
  it('shows loading indicator and disables buttons during send', async () => {
    let resolveUpload
    apiUploadRaw.mockImplementation(
      () => new Promise((resolve) => { resolveUpload = resolve }),
    )

    render(<AiProductModal onClose={vi.fn()} />)
    const input = getFileInput()
    fireEvent.change(input, { target: { files: [makeImageFile()] } })

    const sendBtn = screen.getByText('admin.ai.send')
    // Click send — the promise won't resolve yet so we stay in loading state
    act(() => {
      fireEvent.click(sendBtn)
    })

    // Now we should be in loading state (promise still pending)
    expect(screen.getByText('admin.ai.sending')).toBeInTheDocument()
    const closeBtn = screen.getByText('admin.ai.close')
    expect(closeBtn.disabled).toBe(true)

    // Resolve to clean up
    await act(async () => {
      resolveUpload({ status: 202 })
    })
  })

  // Req 5.1, 5.3: Success message with "Accept" button on HTTP 202
  it('shows success message with Accept button on HTTP 202', async () => {
    apiUploadRaw.mockResolvedValue({ status: 202 })

    const onClose = vi.fn()
    render(<AiProductModal onClose={onClose} />)
    const input = getFileInput()
    fireEvent.change(input, { target: { files: [makeImageFile()] } })

    const sendBtn = screen.getByText('admin.ai.send')
    await act(async () => {
      fireEvent.click(sendBtn)
    })

    expect(screen.getByText('admin.ai.success')).toBeInTheDocument()
    const acceptBtn = screen.getByText('admin.ai.accept')
    expect(acceptBtn).toBeInTheDocument()

    fireEvent.click(acceptBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Req 5.4: "Retry" and "Close" buttons on error
  it('shows Retry and Close buttons on error response', async () => {
    apiUploadRaw.mockResolvedValue({ status: 500 })

    render(<AiProductModal onClose={vi.fn()} />)
    const input = getFileInput()
    fireEvent.change(input, { target: { files: [makeImageFile()] } })

    const sendBtn = screen.getByText('admin.ai.send')
    await act(async () => {
      fireEvent.click(sendBtn)
    })

    expect(screen.getByText('admin.ai.retry')).toBeInTheDocument()
    expect(screen.getByText('admin.ai.close')).toBeInTheDocument()
    expect(screen.getByText('admin.ai.error.send')).toBeInTheDocument()
  })
})
