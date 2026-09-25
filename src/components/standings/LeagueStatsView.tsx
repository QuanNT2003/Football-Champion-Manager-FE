import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

interface PlayerStatItem {
  player?: {
    id?: string | number;
    name?: string;
    common_name?: string;
    first_name?: string;
    last_name?: string;
  };
  playerId?: string | number;
  playerName?: string;
  club?: {
    name?: string;
  };
  clubName?: string;
  goals?: number;
  assists?: number;
}

interface LeagueStatsViewProps {
  topScorers: PlayerStatItem[];
  topAssists: PlayerStatItem[];
}

export const LeagueStatsView: React.FC<LeagueStatsViewProps> = ({ topScorers, topAssists }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
      {/* Top Scorers */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 1rem 0',
          }}
        >
          <Target size={20} color="#059669" />
          <span>Vua Phá Lưới (Top Scorers)</span>
        </h3>
        {topScorers.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Chưa có bàn thắng nào được ghi nhận.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topScorers.slice(0, 10).map((ps, idx) => {
              const pName =
                ps.player?.name ||
                ps.player?.common_name ||
                `${ps.player?.first_name || ''} ${ps.player?.last_name || ''}`.trim() ||
                ps.playerName ||
                'Cầu Thủ';
              const cName = ps.club?.name || ps.clubName || 'CLB';
              return (
                <div
                  key={ps.player?.id || ps.playerId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: idx === 0 ? '#f0fdf4' : '#f8fafc',
                    border: idx === 0 ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, width: '20px', color: idx === 0 ? '#15803d' : '#64748b' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{pName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{cName}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#059669' }}>
                    {ps.goals || 0} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>BÀN</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Assists */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 1rem 0',
          }}
        >
          <TrendingUp size={20} color="#15803d" />
          <span>Vua Kiến Tạo (Top Assists)</span>
        </h3>
        {topAssists.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Chưa có đường kiến tạo nào được ghi nhận.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topAssists.slice(0, 10).map((ps, idx) => {
              const pName =
                ps.player?.name ||
                ps.player?.common_name ||
                `${ps.player?.first_name || ''} ${ps.player?.last_name || ''}`.trim() ||
                ps.playerName ||
                'Cầu Thủ';
              const cName = ps.club?.name || ps.clubName || 'CLB';
              return (
                <div
                  key={ps.player?.id || ps.playerId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: idx === 0 ? '#f0fdf4' : '#f8fafc',
                    border: idx === 0 ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, width: '20px', color: idx === 0 ? '#15803d' : '#64748b' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{pName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{cName}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#15803d' }}>
                    {ps.assists || 0} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>KIẾN TẠO</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
