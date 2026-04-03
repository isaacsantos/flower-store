import './LanguageSwitcher.css'
import { useLocale } from '../i18n/LocaleContext'
import { SUPPORTED_LOCALES } from '../i18n/translations'

const LOCALE_LABELS = { es: 'ES', en: 'EN', fr: 'FR', ko: '한국어' }

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <select
      className="language-switcher"
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      aria-label="Select language"
    >
      {SUPPORTED_LOCALES.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </select>
  )
}
