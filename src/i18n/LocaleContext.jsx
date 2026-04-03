import { createContext, useContext, useState } from 'react'
import { translations, SUPPORTED_LOCALES, DEFAULT_LOCALE, STORAGE_KEY } from './translations.js'

const LocaleContext = createContext(null)

function readStoredLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored
    return DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

function writeStoredLocale(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // private browsing or quota exceeded — continue with in-memory only
  }
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => readStoredLocale())

  function setLocale(code) {
    if (!SUPPORTED_LOCALES.includes(code)) return
    setLocaleState(code)
    writeStoredLocale(code)
  }

  function t(key) {
    const localeMap = translations[locale]
    if (localeMap && Object.prototype.hasOwnProperty.call(localeMap, key)) return localeMap[key]
    const fallbackMap = translations[DEFAULT_LOCALE]
    if (fallbackMap && Object.prototype.hasOwnProperty.call(fallbackMap, key)) return fallbackMap[key]
    return key
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider')
  return ctx
}
