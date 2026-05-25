import './ChannelPickerModal.css'
import { useLocale } from '../i18n/LocaleContext'

export default function ChannelPickerModal({ onSelect, onClose }) {
  const { t } = useLocale()

  return (
    <div className="cpm-overlay" onClick={onClose}>
      <div className="cpm-modal" onClick={e => e.stopPropagation()}>
        <h2 className="cpm-title">{t('channelPicker.title')}</h2>
        <p className="cpm-sub">{t('channelPicker.sub')}</p>
        <div className="cpm-options">
          <button className="cpm-option cpm-option--whatsapp" onClick={() => onSelect('whatsapp')}>
            <span className="cpm-option-icon">💬</span>
            <span>WhatsApp</span>
          </button>
          <button className="cpm-option cpm-option--messenger" onClick={() => onSelect('messenger')}>
            <span className="cpm-option-icon">💬</span>
            <span>Messenger</span>
          </button>
        </div>
        <button className="cpm-cancel" onClick={onClose}>
          {t('channelPicker.cancel')}
        </button>
      </div>
    </div>
  )
}
