import './BranchPickerModal.css'
import { BRANCHES } from '../utils/nearestBranch'
import { useLocale } from '../i18n/LocaleContext'

export default function BranchPickerModal({ onSelect, onClose }) {
  const { t } = useLocale()

  return (
    <div className="bpm-overlay" onClick={onClose}>
      <div className="bpm-modal" onClick={e => e.stopPropagation()}>
        <h2 className="bpm-title">{t('branchPicker.title')}</h2>
        <p className="bpm-sub">{t('branchPicker.sub')}</p>
        <div className="bpm-options">
          {BRANCHES.map(branch => (
            <button
              key={branch.id}
              className="bpm-option"
              onClick={() => onSelect(branch)}
            >
              <span className="bpm-option-icon">🌸</span>
              <span>{t(`contact.${branch.key}.name`)}</span>
            </button>
          ))}
        </div>
        <button className="bpm-cancel" onClick={onClose}>
          {t('branchPicker.cancel')}
        </button>
      </div>
    </div>
  )
}
