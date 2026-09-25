import React from 'react';
import { Trophy } from 'lucide-react';
import { StandingItem } from '../../types';

interface LeagueStandingsTableProps {
  currentTableRows: StandingItem[];
  currentClubId?: string;
  currentTier?: number | null;
  compFormatType?: string;
  groupName?: string;
}

export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({
  currentTableRows,
  currentClubId,
  currentTier,
  compFormatType,
  groupName,
}) => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      {groupName && (
        <div
          style={{
            background: 'linear-gradient(90deg, #166534 0%, #15803d 100%)',
            color: '#ffffff',
            padding: '12px 16px',
            fontWeight: 800,
            fontSize: '1rem',
          }}
        >
          {groupName} - Bảng Xếp Hạng
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.82rem', textTransform: 'uppercase' }}>
              <th style={{ width: '55px', textAlign: 'center', padding: '12px 8px' }}>Hạng</th>
              <th style={{ textAlign: 'left', padding: '12px 14px' }}>Câu Lạc Bộ</th>
              <th style={{ textAlign: 'center', width: '60px' }}>Trận</th>
              <th style={{ textAlign: 'center', width: '55px', color: '#059669' }}>Thắng</th>
              <th style={{ textAlign: 'center', width: '55px', color: '#64748b' }}>Hòa</th>
              <th style={{ textAlign: 'center', width: '55px', color: '#dc2626' }}>Thua</th>
              <th style={{ textAlign: 'center', width: '60px' }}>BT</th>
              <th style={{ textAlign: 'center', width: '60px' }}>BB</th>
              <th style={{ textAlign: 'center', width: '60px' }}>HS</th>
              <th style={{ textAlign: 'center', width: '70px', fontWeight: 800, color: '#15803d' }}>ĐIỂM</th>
            </tr>
          </thead>
          <tbody>
            {currentTableRows.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                  <Trophy size={36} color="#cbd5e1" style={{ marginBottom: '8px', display: 'inline-block' }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Chưa có dữ liệu bảng xếp hạng cho giải đấu này.</p>
                </td>
              </tr>
            ) : (
              currentTableRows.map((row, idx) => {
                const clubId = row.club?.id || row.club_id;
                const isCurrent = clubId && clubId.toString() === currentClubId?.toString();
                const pos = row.position || idx + 1;
                const wins = row.wins ?? row.won ?? 0;
                const draws = row.draws ?? row.drawn ?? 0;
                const losses = row.losses ?? row.lost ?? 0;
                const gf = row.goals_for ?? 0;
                const ga = row.goals_against ?? 0;
                const gd = row.goal_difference ?? gf - ga;
                const pts = row.points ?? 0;

                // Promotion & Relegation badges based on Tier
                let posBg = '#f1f5f9';
                let posColor = '#475569';
                let badgeTooltip = '';

                if (compFormatType === 'GROUP_KNOCKOUT') {
                  if (pos <= 2) {
                    posBg = '#dcfce7';
                    posColor = '#15803d';
                    badgeTooltip = 'Vào Vòng Knockout (Top 2)';
                  }
                } else if (currentTier === 1) {
                  if (pos <= 3) {
                    posBg = '#dbeafe';
                    posColor = '#1e40af';
                    badgeTooltip = 'Cúp C1 Châu Lục';
                  } else if (pos <= 5) {
                    posBg = '#e0e7ff';
                    posColor = '#4338ca';
                    badgeTooltip = 'Cúp C2 Châu Lục';
                  } else if (pos <= 7) {
                    posBg = '#fef3c7';
                    posColor = '#92400e';
                    badgeTooltip = 'Cúp C3 Châu Lục';
                  } else if (pos >= 15) {
                    posBg = '#fee2e2';
                    posColor = '#dc2626';
                    badgeTooltip = 'Xuống Hạng Nhất (Tier 2)';
                  }
                } else if (currentTier === 2) {
                  if (pos === 1) {
                    posBg = '#dcfce7';
                    posColor = '#15803d';
                    badgeTooltip = 'Thăng Hạng Tier 1 (VĐQG)';
                  } else if (pos >= 15) {
                    posBg = '#fee2e2';
                    posColor = '#dc2626';
                    badgeTooltip = 'Xuống Hạng Nhì (Tier 3)';
                  }
                } else if (currentTier === 3) {
                  if (pos === 1) {
                    posBg = '#dcfce7';
                    posColor = '#15803d';
                    badgeTooltip = 'Thăng Hạng Tier 2 (Hạng Nhất)';
                  } else if (pos >= 15) {
                    posBg = '#fee2e2';
                    posColor = '#dc2626';
                    badgeTooltip = 'Xuống Hạng Ba (Tier 4)';
                  }
                } else if (currentTier === 4) {
                  if (pos === 1) {
                    posBg = '#dcfce7';
                    posColor = '#15803d';
                    badgeTooltip = 'Thăng Hạng Tier 3 (Hạng Nhì)';
                  }
                }

                return (
                  <tr
                    key={row.id || idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isCurrent ? '#f0fdf4' : 'transparent',
                      fontWeight: isCurrent ? 700 : 400,
                    }}
                  >
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                      <span
                        title={badgeTooltip}
                        style={{
                          display: 'inline-block',
                          width: '26px',
                          height: '26px',
                          lineHeight: '26px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          backgroundColor: posBg,
                          color: posColor,
                        }}
                      >
                        {pos}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            flexShrink: 0,
                          }}
                        >
                          {row.club?.logo_url ? (
                            <img
                              src={row.club.logo_url}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            '⚽'
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span
                            style={{
                              color: isCurrent ? '#15803d' : '#0f172a',
                              fontWeight: isCurrent ? 800 : 600,
                              fontSize: '0.9rem',
                            }}
                          >
                            {row.club?.name || (row as any).club_name || `CLB #${clubId}`}
                          </span>
                          {isCurrent && (
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#15803d',
                                color: '#ffffff',
                                fontWeight: 700,
                              }}
                            >
                              BẠN
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#475569', fontSize: '0.88rem' }}>{row.played || 0}</td>
                    <td style={{ textAlign: 'center', color: '#059669', fontSize: '0.88rem' }}>{wins}</td>
                    <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{draws}</td>
                    <td style={{ textAlign: 'center', color: '#dc2626', fontSize: '0.88rem' }}>{losses}</td>
                    <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{gf}</td>
                    <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{ga}</td>
                    <td
                      style={{
                        textAlign: 'center',
                        color: gd > 0 ? '#059669' : gd < 0 ? '#dc2626' : '#64748b',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                      }}
                    >
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>
                      {pts}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
