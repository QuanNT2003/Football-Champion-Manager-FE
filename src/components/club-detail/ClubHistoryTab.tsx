import React from 'react';
import {
  Trophy,
  History,
} from 'lucide-react';
import { ClubSeasonHistoryResponse } from '../../types';
import { useTranslation } from '../../i18n';
import { useTournamentLocale } from '../../utils/tournamentLocalization';

interface Props {
  seasonHistory: ClubSeasonHistoryResponse | null;
  loadingHistory: boolean;
}

export const ClubHistoryTab: React.FC<Props> = ({
  seasonHistory,
  loadingHistory,
}) => {
  const { t } = useTranslation();
  const { comp } = useTournamentLocale();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* TỦ CÚP VÀNG */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
          border: '1.5px solid #d97706',
          borderRadius: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '12px',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#fef08a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Trophy size={18} style={{ color: '#fef08a' }} />
              {t('club_detail.trophy_room')}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
              {t('club_detail.trophy_room_sub')}
            </span>
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              background: 'rgba(254, 240, 138, 0.2)',
              color: '#fef08a',
              padding: '3px 10px',
              borderRadius: '12px',
            }}
          >
            {t('club_detail.total_trophies', 'Tổng: {count}').replace(
              '{count}',
              String(seasonHistory?.totalTrophies ?? 0),
            )}
          </span>
        </div>

        {seasonHistory?.trophies && seasonHistory.trophies.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
            }}
          >
            {seasonHistory.trophies.map((tr) => (
              <div
                key={tr.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(254, 240, 138, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🏆</div>
                <strong style={{ fontSize: '0.85rem', color: '#fef08a', display: 'block' }}>
                  {comp(tr.competition_name)}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                  Mùa {tr.season_number}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
            }}
          >
            <Trophy size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <span>{t('club_detail.no_trophies')}</span>
          </div>
        )}
      </div>

      {/* BẢNG THÀNH TÍCH QUA CÁC MÙA GIẢI */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px 20px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
          {t('club_detail.season_records')}
        </h4>

        {seasonHistory?.seasons && seasonHistory.seasons.length > 0 ? (
          <table className="table-hud">
            <thead>
              <tr>
                <th>{t('club_detail.col_season')}</th>
                <th>{t('club_detail.col_comp')}</th>
                <th>{t('club_detail.col_rank')}</th>
                <th>{t('club_detail.col_played')}</th>
                <th>{t('club_detail.col_record')}</th>
                <th>{t('club_detail.col_gd')}</th>
                <th>{t('club_detail.col_pts')}</th>
                <th>{t('club_detail.col_achievement')}</th>
              </tr>
            </thead>
            <tbody>
              {seasonHistory.seasons.map((rec) => (
                <tr key={rec.id}>
                  <td><strong>Mùa {rec.season_number}</strong></td>
                  <td><strong>{comp(rec.competition_name)}</strong></td>
                  <td>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      #{rec.position}
                    </span>
                  </td>
                  <td>{rec.played}</td>
                  <td>{rec.wins} - {rec.draws} - {rec.losses}</td>
                  <td>{rec.goal_difference > 0 ? `+${rec.goal_difference}` : rec.goal_difference}</td>
                  <td><strong style={{ color: '#15803d' }}>{rec.points}</strong></td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      {rec.achievement_label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '0.85rem' }}>
            <History size={32} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
            <span>{t('club_detail.no_season_records')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
