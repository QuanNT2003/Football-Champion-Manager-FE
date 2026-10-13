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

        </div>
      </div>
    </section>
  );
};
