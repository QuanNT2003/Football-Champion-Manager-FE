import React from 'react';
import { Trophy, Medal, Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { TrophiesFilterType } from './types';

interface TrophyToolbarProps {
  filterType: TrophiesFilterType;
  setFilterType: (val: TrophiesFilterType) => void;
  totalCount: number;
  championsCount: number;
  runnerUpsCount: number;
}

export const TrophyToolbar: React.FC<TrophyToolbarProps> = ({
  filterType,
  setFilterType,
  totalCount,
  championsCount,
  runnerUpsCount,
}) => {
  const { t } = useTranslation();

  return (
    <section className="trophy-toolbar-section">
      <div className="trophy-filter-pills">
        <button
          className={`filter-pill-btn ${filterType === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterType('ALL')}
        >
          <span>{t('trophies.filter_all')}</span>
          <span className="pill-count-tag">{totalCount}</span>
        </button>
        <button
          className={`filter-pill-btn ${filterType === 'CHAMPION' ? 'active' : ''}`}
          onClick={() => setFilterType('CHAMPION')}
        >
          <Trophy size={13} className="text-amber-500" />
          <span>{t('trophies.filter_champions')}</span>
          <span className="pill-count-tag">{championsCount}</span>
        </button>
        <button
          className={`filter-pill-btn ${filterType === 'RUNNER_UP' ? 'active' : ''}`}
          onClick={() => setFilterType('RUNNER_UP')}
        >
          <Medal size={13} className="text-slate-400" />
          <span>{t('trophies.filter_runners_up')}</span>
          <span className="pill-count-tag">{runnerUpsCount}</span>
        </button>
      </div>

      <div className="trophy-cabinet-info-badge">
        <Sparkles size={14} className="text-amber-500" />
        <span>{t('trophies.toolbar_grouped_badge')}</span>
      </div>
    </section>
  );
};
