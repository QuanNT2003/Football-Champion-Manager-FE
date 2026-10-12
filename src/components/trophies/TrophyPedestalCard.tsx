import React from 'react';
import { Calendar, Star, ExternalLink } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { GroupedTrophy } from './types';

interface TrophyPedestalCardProps {
  item: GroupedTrophy;
  onSelect: (item: GroupedTrophy) => void;
}

export const TrophyPedestalCard: React.FC<TrophyPedestalCardProps> = ({ item, onSelect }) => {
  const { t } = useTranslation();

  const getRankBadgeInfo = () => {
    switch (item.title_type) {
      case 'CHAMPION':
        return {
          label:
            item.count > 1
              ? t('trophies.rank_champion_multi', { count: item.count })
              : t('trophies.rank_champion_single'),
          badgeClass: 'champion',
          icon: '🏆',
        };
      case 'RUNNER_UP':
        return {
          label:
            item.count > 1
              ? t('trophies.rank_runner_up_multi', { count: item.count })
              : t('trophies.rank_runner_up_single'),
          badgeClass: 'runner_up',
          icon: '🥈',
        };
      case 'THIRD_PLACE':
        return {
          label:
            item.count > 1
              ? t('trophies.rank_third_place_multi', { count: item.count })
              : t('trophies.rank_third_place_single'),
          badgeClass: 'third_place',
          icon: '🥉',
        };
      default:
        return {
          label:
            item.count > 1
              ? t('trophies.rank_default_multi', { count: item.count })
              : t('trophies.rank_default_single'),
          badgeClass: 'default',
          icon: '🎖️',
        };
    }
  };

  const rankInfo = getRankBadgeInfo();

  return (
    <div
      className={`trophy-display-pedestal ${item.title_type.toLowerCase()} group-pedestal`}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      title="Nhấn để xem chi tiết từng mùa giải"
    >
      <div className="pedestal-glow-fx" />

      {item.count > 1 && (
        <div className="trophy-multiplier-badge" title={`Đoạt cúp ${item.count} lần`}>
          <Star size={12} className="fill-white text-white" />
          <span>×{item.count}</span>
        </div>
      )}

      <div className="trophy-cup-model">
        {item.trophy_url ? (
          <img src={item.trophy_url} alt={item.trophy_name} className="trophy-3d-img" />
        ) : (
          <div className={`trophy-icon-hero ${rankInfo.badgeClass}`}>{rankInfo.icon}</div>
        )}
      </div>

      <div className="pedestal-metal-stand">
        <div className="pedestal-rank-container">
          <span className={`pedestal-rank-tag ${rankInfo.badgeClass}`}>{rankInfo.label}</span>
        </div>

        <h3 className="pedestal-trophy-title" title={item.trophy_name}>
          {item.trophy_name}
        </h3>

        <span className="pedestal-comp-name" title={item.competition_name}>
          {item.competition_name}
        </span>

        <div className="pedestal-seasons-row">
          {item.seasons.map((s) => (
            <span key={s} className="pedestal-season-chip">
              <Calendar size={10} className="chip-cal-icon" />
              <span>{t('trophies.season_chip', { season: s })}</span>
            </span>
          ))}
        </div>

        <div className="pedestal-meta-row">
          <span className="pedestal-view-detail ml-auto">
            {t('trophies.view_details')} <ExternalLink size={10} className="inline ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
