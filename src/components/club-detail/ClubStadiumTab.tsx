import React from 'react';
import {
  Building2,
} from 'lucide-react';
import { Club, ClubStadiumResponse } from '../../types';
import { useTranslation } from '../../i18n';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  club: Club;
  stadiumInfo: ClubStadiumResponse | null;
}

export const ClubStadiumTab: React.FC<Props> = ({
  club,
  stadiumInfo,
}) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stadium Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#15803d',
              background: '#dcfce7',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {t('club_detail.stadium_info')}
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '8px 0 4px', color: '#0f172a' }}>
            {stadiumInfo?.name || club.stadium?.name || 'Sân Vận Động Trung Tâm'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {club.city || 'Việt Nam'} • {stadiumInfo?.pitch_type || 'Mặt cỏ tự nhiên lai ghép (Hybrid)'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ background: '#f8fafc', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700 }}>
              {t('club_detail.capacity')}
            </span>
            <strong style={{ fontSize: '1.3rem', fontFamily: 'var(--font-game)', color: '#15803d' }}>
              {(stadiumInfo?.capacity || club.stadium?.capacity || 25000).toLocaleString()} {t('club_detail.seats')}
            </strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700 }}>
              {t('club_detail.condition_pitch')}
            </span>
            <strong style={{ fontSize: '1.3rem', fontFamily: 'var(--font-game)', color: '#0284c7' }}>
              {stadiumInfo?.condition || 98.5}%
            </strong>
          </div>
        </div>
      </div>

      {/* 4 Khán đài */}
      <div className="glass-panel" style={{ padding: '18px 22px' }}>
        <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
          {t('club_detail.stands_overview')}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {(stadiumInfo?.stands || [
            { name: 'Khán đài A (Main Stand)', capacity: 10000, vipSeats: 1500, covered: true },
            { name: 'Khán đài B (Opposite Stand)', capacity: 7500, vipSeats: 200, covered: true },
            { name: 'Khán đài C (North Stand)', capacity: 3750, vipSeats: 0, covered: false },
            { name: 'Khán đài D (South Stand)', capacity: 3750, vipSeats: 0, covered: false },
          ]).map((st, i) => (
            <div key={i} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{st.name}</strong>
                {st.covered && (
                  <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                    {t('club_detail.roof_cover')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-game)', margin: '4px 0 2px', color: '#1e293b' }}>
                {st.capacity.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>{t('club_detail.seats')}</span>
              </div>
              {st.vipSeats > 0 ? (
                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>
                  ⭐ {st.vipSeats} {t('club_detail.vip_seats', 'ghế VIP')}
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('club_detail.general_stand')}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CƠ SỞ VẬT CHẤT TỪ CSDL (FACILITIES) */}
      <div className="glass-panel" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} style={{ color: '#15803d' }} />
              {t('club_detail.facilities_title')}
            </h4>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              {t('club_detail.facilities_sub')}
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '12px' }}>
            {t('club_detail.facilities_count', '{count} Hạng mục').replace(
              '{count}',
              String(stadiumInfo?.facilities?.length ?? 5),
            )}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {(stadiumInfo?.facilities || []).map((fac) => (
            <div
              key={fac.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.8rem' }}>{fac.icon || '🏛️'}</div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px' }}>
                    {t('club_detail.level_txt')} {fac.level} / {fac.max_level || 10}
                  </span>
                </div>

                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{fac.name}</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{fac.description}</p>

                {/* Progress bar 10 nấc */}
                <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                  {Array.from({ length: 10 }).map((_, stepIdx) => (
                    <div
                      key={stepIdx}
                      style={{
                        height: '6px',
                        flex: 1,
                        borderRadius: '2px',
                        background: stepIdx < fac.level ? '#10b981' : '#e2e8f0',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                {fac.next_cost ? (
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>{t('club_detail.next_upgrade')}</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'var(--font-game)' }}>{formatCurrency(fac.next_cost)}</strong>
                    <span style={{ color: '#94a3b8', display: 'block' }}>({fac.next_upgrade_days || 7} {t('club_detail.construction_days')})</span>
                  </div>
                ) : (
                  <span style={{ color: '#15803d', fontWeight: 800 }}>{t('club_detail.max_level_reached')}</span>
                )}

                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem' }}>
                  {fac.status || 'OPERATIONAL'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
