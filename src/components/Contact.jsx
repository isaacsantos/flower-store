import './Contact.css'
import { useLocale } from '../i18n/LocaleContext'

const BRANCHES = [
  {
    id: 1,
    nameKey: 'contact.branch1.name',
    addressKey: 'contact.branch1.address',
    hoursKey: 'contact.branch1.hours',
    mapSrc: 'https://maps.google.com/maps?q=Afectaci%C3%B3n+403+C+Residencial+Los+Mezquites+San+Nicol%C3%A1s+de+los+Garza+Nuevo+Le%C3%B3n+M%C3%A9xico&output=embed',
    mapLink: 'https://maps.google.com/?q=Afectaci%C3%B3n+403+C+Residencial+Los+Mezquites+San+Nicol%C3%A1s+de+los+Garza+Nuevo+Le%C3%B3n',
  },
]

export default function Contact() {
  const { t } = useLocale()

  return (
    <main className="contact-page">
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
              <a
                href={branch.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="branch-directions-btn"
              >
                {t('contact.directions')}
              </a>
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
