import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { GroupedTrophy } from './types';

interface TrophyDetailModalProps {
  item: GroupedTrophy;
  onClose: () => void;
}

export const TrophyDetailModal: React.FC<TrophyDetailModalProps> = ({ item, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="trophy-modal-backdrop" onClick={onClose}>
      <div className="trophy-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-dialog-header">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="modal-trophy-title">{item.trophy_name}</h3>
              <span className="modal-trophy-comp">{item.competition_name}</span>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-dialog-body">
          <div className="modal-summary-banner">
            <div className="modal-badge-large">×{item.count}</div>
            <div>
              <strong className="text-sm text-slate-800">
                {t('trophies.modal_summary', { count: item.count })}
              </strong>
              <p className="text-xs text-slate-500 m-0">{t('trophies.modal_sub')}</p>
            </div>
          </div>

          <div className="modal-seasons-timeline">
            {item.history.map((h, idx) => (
              <div key={h.id} className="modal-history-item">
                <div className="history-num-badge">#{idx + 1}</div>
                <div className="history-info-col">
                  <strong className="history-season-title">
                    {t('trophies.season_chip', { season: h.season_number })}
                  </strong>
                </div>
                <span className="history-trophy-star">★</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
