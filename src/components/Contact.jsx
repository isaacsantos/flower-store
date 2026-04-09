import './Contact.css'
import { useLocale } from '../i18n/LocaleContext'

const BRANCH1_WA = import.meta.env.VITE_BRANCH1_WHATSAPP ?? ''
const BRANCH2_WA = import.meta.env.VITE_BRANCH2_WHATSAPP ?? ''

const BRANCHES = [
  {
    id: 1,
    nameKey: 'contact.branch1.name',
    addressKey: 'contact.branch1.address',
    hoursKey: 'contact.branch1.hours',
    mapSrc: 'https://maps.google.com/maps?q=Afectaci%C3%B3n+403+C+Residencial+Los+Mezquites+San+Nicol%C3%A1s+de+los+Garza+Nuevo+Le%C3%B3n+M%C3%A9xico&output=embed',
    mapLink: 'https://maps.google.com/?q=Afectaci%C3%B3n+403+C+Residencial+Los+Mezquites+San+Nicol%C3%A1s+de+los+Garza+Nuevo+Le%C3%B3n',
    whatsapp: BRANCH1_WA,
  },
  {
    id: 2,
    nameKey: 'contact.branch2.name',
    addressKey: 'contact.branch2.address',
    hoursKey: 'contact.branch2.hours',
    mapSrc: 'https://maps.google.com/maps?q=Avenida+Casa+Blanca+530+Villas+de+Casa+Blanca+San+Nicol%C3%A1s+de+los+Garza+Nuevo+Le%C3%B3n+M%C3%A9xico&output=embed',
    mapLink: 'https://maps.google.com/?q=Avenida+Casa+Blanca+530+Villas+de+Casa+Blanca+San+Nicol%C3%A1s+de+los+Garza',
    whatsapp: BRANCH2_WA,
  },
]

export default function Contact() {
  const { t } = useLocale()

  return (
    <main className="contact-page">
      <div className="contact-bg">
        <div className="contact-float contact-float-1">🌸</div>
        <div className="contact-float contact-float-2">🌷</div>
        <div className="contact-float contact-float-3">🌺</div>
        <div className="contact-float contact-float-4">🍃</div>
        <div className="contact-float contact-float-5">🌼</div>
        <div className="contact-float contact-float-6">💐</div>
      </div>
      <div className="contact-hero">
        <p className="contact-eyebrow">{t('contact.eyebrow')}</p>
        <h1 className="contact-title">{t('contact.title')}</h1>
        <p className="contact-sub">{t('contact.sub')}</p>
      </div>

      <div className="contact-branches">
        {BRANCHES.map(branch => (
          <div key={branch.id} className="branch-card">
            <div className="branch-info">
              <h2 className="branch-name">{t(branch.nameKey)}</h2>
              <div className="branch-detail">
                <span className="branch-icon">📍</span>
                <p>{t(branch.addressKey)}</p>
              </div>
              <div className="branch-detail">
                <span className="branch-icon">🕐</span>
                <p>{t(branch.hoursKey)}</p>
              </div>
              <div className="branch-actions">
                <a
                  href={branch.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="branch-directions-btn"
                >
                  {t('contact.directions')}
                </a>
                {branch.whatsapp && (
                  <a
                    href={`https://wa.me/${branch.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="branch-wa-btn"
                  >
                    {t('contact.whatsapp')}
                  </a>
                )}
              </div>
            </div>
            <div className="branch-map">
              <iframe
                title={t(branch.nameKey)}
                src={branch.mapSrc}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
