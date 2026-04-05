import { useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import './NotFound.css'

export default function NotFound() {
  const { t } = useLocale()
  const navigate = useNavigate()

  return (
    <div className="nf-page">
      <div className="nf-bg">
        <div className="nf-float nf-float-1">🌸</div>
        <div className="nf-float nf-float-2">🌷</div>
        <div className="nf-float nf-float-3">🌺</div>
        <div className="nf-float nf-float-4">🍃</div>
        <div className="nf-float nf-float-5">🌼</div>
      </div>

      <div className="nf-content">
        <div className="nf-emoji">{t('notfound.emoji')}</div>
        <h1 className="nf-title">{t('notfound.title')}</h1>
        <p className="nf-sub">{t('notfound.sub')}</p>
        <button className="nf-cta" onClick={() => navigate('/')}>
          {t('notfound.cta')}
        </button>
      </div>
    </div>
  )
}
