import './Banner.css'
import { useLocale } from '../i18n/LocaleContext'

export default function Banner() {
  const { t } = useLocale()

  return (
    <section className="banner" id="home">
      <div className="banner-bg">
        <div className="petal petal-1">🌸</div>
        <div className="petal petal-2">🌺</div>
        <div className="petal petal-3">🌼</div>
        <div className="petal petal-4">🌷</div>
        <div className="petal petal-5">🌹</div>
        <div className="petal petal-6">💐</div>
      </div>

      <div className="banner-content">
        <p className="banner-eyebrow">{t('banner.eyebrow')}</p>
        <h1 className="banner-title">
          {t('banner.title')}<br />
          <span className="banner-accent">{t('banner.title.accent')}</span>
        </h1>
        <p className="banner-sub">{t('banner.sub')}</p>
        <div className="banner-actions">
          <button className="btn-primary">{t('banner.cta.primary')}</button>
          <button className="btn-ghost">{t('banner.cta.ghost')}</button>
        </div>
      </div>

      <div className="banner-image-wrap">
        <div className="banner-blob"></div>
        <img
          className="banner-img"
          src="https://floreriabriceida.com/store/wp-content/uploads/100-rosas-cansasta.jpg?w=600&q=80"
          alt="Beautiful flower bouquet"
        />
        <div className="badge badge-1">🌹 Same-day delivery</div>
        <div className="badge badge-2">💐 100% Fresh</div>
      </div>

      <div className="banner-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fff7f0"/>
        </svg>
      </div>
    </section>
  )
}
