// Feature: product-condition, Property 2: Form submission payload includes correctly typed condition fields
// Feature: product-condition, Property 3: Form validation rejects invalid conditionRating values
import { describe, it, beforeEach, afterEach, expect } from 'vitest'
import { render, fireEvent, waitFor, cleanup, within } from '@testing-library/react'
import * as fc from 'fast-check'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import ProductForm from './ProductForm.jsx'

let capturedPayload = null
const mockApiRequest = vi.fn((path, options, _user) => {
  // Capture only the product creation/update payload (not tags or other calls)
  if (options && options.body && (options.method === 'POST' || options.method === 'PUT') && !path.includes('/tags') && !path.includes('/images')) {
    capturedPayload = JSON.parse(options.body)
  }
  return Promise.resolve({ id: 1 })
})

vi.mock('../utils/apiClient.js', () => ({
  ADMIN_API_URL: 'http://test-api/products',
  apiRequest: (...args) => mockApiRequest(...args),
  apiUpload: vi.fn().mockResolvedValue({}),
}))

vi.mock('../firebase/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { getIdToken: vi.fn().mockResolvedValue('fake-token') },
    loading: false,
    isAdmin: true,
  }),
}))

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  capturedPayload = null
  mockApiRequest.mockClear()
})

function renderForm(product = null) {
  return render(
    <LocaleProvider>
      <ProductForm product={product} onClose={vi.fn()} onSaved={vi.fn()} />
    </LocaleProvider>
  )
}

/**
 * Validates: Requirements 1.4
 *
 * Property 2: Form submission payload includes correctly typed condition fields
 * For any valid conditionType ("NEW" or "USED") and valid conditionRating (integer 1–10)
 * entered in the form, when the form is submitted, the JSON payload sent to the API
 * SHALL contain `conditionType` as a string and `conditionRating` as an integer matching
 * the entered values.
 */
describe('Property 2: Form submission payload includes correctly typed condition fields', () => {
  it('payload contains conditionType as string and conditionRating as integer matching entered values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('NEW', 'USED'),
        fc.integer({ min: 1, max: 10 }),
        async (conditionType, conditionRating) => {
          capturedPayload = null
          mockApiRequest.mockClear()
          cleanup()

          const { container, unmount } = renderForm()
          const form = within(container)

          // Fill required fields (labels are in Spanish - default locale)
          const nameInput = form.getByRole('textbox', { name: /nombre/i })
          fireEvent.change(nameInput, { target: { value: 'Test Product' } })

          const descriptionInput = form.getByRole('textbox', { name: /descripción/i })
          fireEvent.change(descriptionInput, { target: { value: 'A test description' } })

          // Fill condition fields
          const conditionSelect = form.getByRole('combobox', { name: /tipo de condición/i })
          fireEvent.change(conditionSelect, { target: { value: conditionType } })

          const ratingInput = form.getByRole('spinbutton', { name: /calificación de condición/i })
          fireEvent.change(ratingInput, { target: { value: String(conditionRating) } })

          // Submit the form
          const submitButton = form.getByRole('button', { name: /guardar/i })
          fireEvent.click(submitButton)

          await waitFor(() => {
            expect(capturedPayload).not.toBeNull()
          })

          // Verify payload types and values
          expect(typeof capturedPayload.conditionType).toBe('string')
          expect(capturedPayload.conditionType).toBe(conditionType)
          expect(Number.isInteger(capturedPayload.conditionRating)).toBe(true)
          expect(capturedPayload.conditionRating).toBe(conditionRating)

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)
})

/**
 * Validates: Requirements 1.5
 *
 * Property 3: Form validation rejects invalid conditionRating values
 * For any numeric value that is not an integer or is outside the range 1–10
 * (including 0, negative numbers, decimals, and values > 10), when entered as
 * conditionRating and the form is submitted, the form SHALL prevent submission
 * and display a validation error adjacent to the conditionRating field.
 */
describe('Property 3: Form validation rejects invalid conditionRating values', () => {
  it('rejects invalid conditionRating values and shows validation error', () => {
    const invalidRatingArb = fc.oneof(
      // Floats / decimals (not integers)
      fc.double({ min: 0.01, max: 9.99, noNaN: true }).filter(v => !Number.isInteger(v)),
      // Zero
      fc.constant(0),
      // Negative numbers
      fc.integer({ min: -1000, max: -1 }),
      // Values greater than 10
      fc.integer({ min: 11, max: 10000 }),
      // Large numbers
      fc.integer({ min: 100, max: 999999 })
    )

    fc.assert(
      fc.property(
        invalidRatingArb,
        (invalidRating) => {
          mockApiRequest.mockClear()
          cleanup()

          const { container, unmount } = renderForm()
          const form = within(container)

          // Fill conditionType with a valid value so only rating validation triggers
          const conditionTypeSelect = form.getByRole('combobox', { name: /tipo de condición/i })
          fireEvent.change(conditionTypeSelect, { target: { value: 'NEW' } })

          // Fill required fields (name, description) to avoid other validation
          const nameInput = form.getByRole('textbox', { name: /nombre/i })
          fireEvent.change(nameInput, { target: { value: 'Test Product' } })

          const descriptionInput = form.getByRole('textbox', { name: /descripción/i })
          fireEvent.change(descriptionInput, { target: { value: 'Test description' } })

          // Set the invalid conditionRating value
          const ratingInput = form.getByRole('spinbutton', { name: /calificación de condición/i })
          fireEvent.change(ratingInput, { target: { value: String(invalidRating) } })

          // Submit the form
          const formEl = container.querySelector('form')
          fireEvent.submit(formEl)

          // Verify validation error is displayed
          const errorSpan = container.querySelector('.admin-form-field-error')
          expect(errorSpan).not.toBeNull()
          expect(errorSpan.textContent.length).toBeGreaterThan(0)

          // Verify the API was NOT called (form submission was prevented)
          expect(mockApiRequest).not.toHaveBeenCalledWith(
            expect.stringMatching(/products$/),
            expect.objectContaining({ method: 'POST' }),
            expect.anything()
          )

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)
})
