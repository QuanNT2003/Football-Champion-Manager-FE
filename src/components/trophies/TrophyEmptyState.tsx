import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Club } from '../../types';

interface TrophyEmptyStateProps {
  club: Club | null;
}

export const TrophyEmptyState: React.FC<TrophyEmptyStateProps> = ({ club }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="trophy-empty-showcase">
      <div className="empty-cabinet-interior">
        <div className="empty-pedestal-light" />
        <div className="empty-pedestal-circle">
          <span className="empty-cup-silhouette">🏆</span>
          <Sparkles size={24} className="empty-sparkle-icon" />
        </div>

        <div className="empty-message-col">
          <h2 className="empty-main-heading">{t('trophies.empty_title')}</h2>
          <p className="empty-sub-desc">
            {t('trophies.empty_desc', { clubName: club?.name || 'CLB' })}
          </p>

          <div className="empty-target-cards-row">
            <div className="target-quest-card">
              <div className="quest-icon-badge">🏆</div>
              <div className="quest-details">
                <strong className="quest-name">{t('trophies.quest_tier3_title')}</strong>
                <span className="quest-target-text">{t('trophies.quest_tier3_desc')}</span>
              </div>
              <button className="btn-quest-go" onClick={() => navigate('/standings')}>
                <span>{t('trophies.btn_view_standings')}</span>
              </button>
            </div>

            <div className="target-quest-card">
              <div className="quest-icon-badge gold">🥇</div>
              <div className="quest-details">
                <strong className="quest-name">{t('trophies.quest_cup_title')}</strong>
                <span className="quest-target-text">{t('trophies.quest_cup_desc')}</span>
              </div>
              <button className="btn-quest-go" onClick={() => navigate('/matches')}>
                <span>{t('trophies.btn_view_fixtures')}</span>
              </button>
            </div>
          </div>

          <div className="empty-action-row">
            <button className="btn-primary-lead" onClick={() => navigate('/tactics')}>
              <Shield size={16} />
              <span>{t('trophies.btn_build_tactics')}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
