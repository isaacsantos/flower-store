import './Banner.css'
import { useLocale } from '../i18n/LocaleContext'

const ACTIVE_BANNER = import.meta.env.VITE_ACTIVE_BANNER ?? 'default'

function DefaultBanner({ t }) {
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
          src="https://res.cloudinary.com/dad8vzwh3/image/upload/v1775270250/1_1_oponzz.jpg?w=600&q=80"
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

function MothersDayBanner({ t }) {
  return (
    <section className="banner banner--mothers" id="home">
      <div className="banner-bg">
        <div className="md-float md-float-1">🌹</div>
        <div className="md-float md-float-2">💝</div>
        <div className="md-float md-float-3">🌸</div>
        <div className="md-float md-float-4">💖</div>
        <div className="md-float md-float-5">🌷</div>
        <div className="md-float md-float-6">💕</div>
        <div className="md-float md-float-7">🌺</div>
        <div className="md-float md-float-8">💗</div>
        <div className="md-ribbon">Happy Mother's Day</div>
      </div>

      <div className="banner-content">
        <p className="banner-eyebrow md-eyebrow">{t('banner.mothers.eyebrow')}</p>
        <h1 className="banner-title">
          {t('banner.mothers.title')}<br />
          <span className="banner-accent md-accent">{t('banner.mothers.title.accent')}</span>
        </h1>
        <p className="banner-sub">{t('banner.mothers.sub')}</p>
        <div className="banner-actions">
          <button className="btn-primary md-btn-primary">{t('banner.mothers.cta.primary')}</button>
          <button className="btn-ghost md-btn-ghost">{t('banner.mothers.cta.ghost')}</button>
        </div>
      </div>

      <div className="banner-image-wrap">
        <div className="banner-blob md-blob"></div>
        <div className="md-heart-ring">
          <span>💗</span><span>🌹</span><span>💗</span><span>🌹</span>
          <span>💗</span><span>🌹</span><span>💗</span><span>🌹</span>
        </div>
        <img
          className="banner-img md-img"
          src="https://res.cloudinary.com/dad8vzwh3/image/upload/v1775401861/11_1_nnraiu.jpg?w=600&q=80"
          alt="Mother's Day flower bouquet"
        />
        <div className="badge md-badge badge-1">{t('banner.mothers.badge1')}</div>
        <div className="badge md-badge badge-2">{t('banner.mothers.badge2')}</div>
      </div>

      <div className="banner-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fff0f8"/>
        </svg>
      </div>
    </section>
  )
}

const BANNERS = {
  'default': DefaultBanner,
  'mothers-day': MothersDayBanner,
}

export default function Banner() {
  const { t } = useLocale()
  const BannerComponent = BANNERS[ACTIVE_BANNER] ?? DefaultBanner
  return <BannerComponent t={t} />
}
