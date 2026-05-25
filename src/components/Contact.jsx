import './Contact.css'
import { useLocale } from '../i18n/LocaleContext'

const WHATSAPP = import.meta.env.VITE_BRANCH1_WHATSAPP ?? ''
const MESSENGER = import.meta.env.VITE_FACEBOOK_MESSENGER ?? ''

export default function Contact() {
  const { t } = useLocale()

  return (
    <main className="contact-page">
      <div className="contact-bg">
        <div className="contact-float contact-float-1">🎮</div>
        <div className="contact-float contact-float-2">🕹️</div>
        <div className="contact-float contact-float-3">👾</div>
        <div className="contact-float contact-float-4">⚡</div>
        <div className="contact-float contact-float-5">🏆</div>
        <div className="contact-float contact-float-6">🎯</div>
      </div>
      <div className="contact-hero">
        <p className="contact-eyebrow">{t('contact.eyebrow')}</p>
        <h1 className="contact-title">{t('contact.title')}</h1>
        <p className="contact-sub">{t('contact.sub')}</p>
      </div>

      <div className="contact-content">
        <div className="contact-card">
          <div className="contact-card-icon">💬</div>
          <h2 className="contact-card-title">{t('contact.channels.title')}</h2>
          <p className="contact-card-desc">{t('contact.channels.desc')}</p>
          <div className="contact-buttons">
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(t('contact.whatsapp.msg'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-wa-btn"
              >
                {t('contact.wa.cta')}
              </a>
            )}
            {MESSENGER && (
              <a
                href={`https://m.me/${MESSENGER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-messenger-btn"
              >
                {t('contact.messenger.cta')}
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
