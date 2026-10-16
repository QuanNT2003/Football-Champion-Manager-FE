import { useTranslation } from '../../i18n';
import React from 'react';
import { PlayerDetailData } from '../../types';

interface Props {
  detail: PlayerDetailData | null;
}

export const PlayerStatsTab: React.FC<Props> = ({ detail }) => {
  const { t } = useTranslation();
  return (
    <div className="pm-stats-view">
      {/* Career Totals Bar */}
      <div className="pm-career-totals-bar">
        <div className="pm-stat-mini">
          <span className="pm-stat-mini-label">{t('player_stats.matches', 'Trận Đấu')}</span>
          <span className="pm-stat-mini-val">
            {detail?.statistics?.career_totals?.matches ?? 0}
          </span>
        </div>
        <div className="pm-stat-mini">
          <span className="pm-stat-mini-label">{t('player_stats.minutes', 'Phút')}</span>
          <span className="pm-stat-mini-val">
            {detail?.statistics?.career_totals?.minutes ?? 0}
          </span>
        </div>
        <div className="pm-stat-mini">
          <span className="pm-stat-mini-label">{t('player_stats.clean_sheets', 'Giữ Sạch Lưới')}</span>
          <span className="pm-stat-mini-val">
            {detail?.statistics?.career_totals?.clean_sheets ?? 0}
          </span>
        </div>
        <div className="pm-stat-mini">
          <span className="pm-stat-mini-label">{t('player_stats.goals', 'Bàn Thắng')}</span>
          <span className="pm-stat-mini-val">
            {detail?.statistics?.career_totals?.goals ?? 0}
          </span>
        </div>
        <div className="pm-stat-mini">
          <span className="pm-stat-mini-label">{t('player_stats.assists', 'Kiến Tạo')}</span>
          <span className="pm-stat-mini-val">
            {detail?.statistics?.career_totals?.assists ?? 0}
          </span>
        </div>
        <div className="pm-stat-mini">
          <span className="pm-stat-mini-label">{t('player_stats.cards', 'Thẻ V/Đ')}</span>
          <span className="pm-stat-mini-val">
            {detail?.statistics?.career_totals?.cards || '0/0'}
          </span>
        </div>
        <div className="pm-stat-mini">
          <span className="pm-stat-mini-label">{t('player_stats.motm', 'MOTM')}</span>
          <span className="pm-stat-mini-val">
            {detail?.statistics?.career_totals?.motm ?? 0}
          </span>
        </div>
        <div className="pm-stat-mini">
          <span className="pm-stat-mini-label">{t('player_stats.rating', 'Điểm TB')}</span>
          <span className="pm-stat-mini-val">
            {Number(detail?.statistics?.career_totals?.rating ?? 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="pm-table-wrapper">
        <table className="pm-data-table">
          <thead>
            <tr>
              <th>{t('player_stats.season', 'Mùa')}</th>
              <th>{t('player_stats.team', 'Đội')}</th>
              <th>{t('player_stats.matches', 'Trận')}</th>
              <th>{t('player_stats.minutes', 'Tổng Phút')}</th>
              <th>{t('player_stats.clean_sheets', 'Giữ Sạch Lưới')}</th>
              <th>{t('player_stats.goals', 'Bàn Thắng')}</th>
              <th>{t('player_stats.assists', 'Kiến Tạo')}</th>
              <th>{t('player_stats.cards', 'Thẻ (V/Đ)')}</th>
              <th>{t('player_stats.motm', 'MOTM')}</th>
              <th className="text-right">{t('player_stats.rating', 'Điểm TB')}</th>
            </tr>
          </thead>
          <tbody>
            {(!detail?.statistics?.seasons || detail.statistics.seasons.length === 0) ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  {t('player.no_stats')}
                </td>
              </tr>
            ) : (
              detail.statistics.seasons.map((s, idx) => (
                <tr key={idx}>
                  <td className="pm-dim-cell">{s.season}</td>
                  <td className="pm-team-name-cell">{s.team}</td>
                  <td>{s.matches}</td>
                  <td>{s.minutes}</td>
                  <td>{s.clean_sheets}</td>
                  <td>{s.goals}</td>
                  <td>{s.assists}</td>
                  <td>{s.cards || `${s.yellow_cards || 0}/${s.red_cards || 0}`}</td>
                  <td>{s.motm}</td>
                  <td className="text-right pm-rating-cell">{Number(s.rating || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
