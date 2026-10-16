import { useTranslation } from '../../i18n';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Target, TrendingUp, Loader2, ChevronRight } from 'lucide-react';
import { playersApi } from '../../services/players.service';
import { Player } from '../../types';

interface PlayerStatItem {
  player?: {
    id?: string | number;
    name?: string;
    common_name?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
  playerId?: string | number;
  playerName?: string;
  club?: {
    name?: string;
    logo_url?: string;
  };
  clubName?: string;
  goals?: number;
  assists?: number;
}

interface LeagueStatsViewProps {
  topScorers: PlayerStatItem[];
  topAssists: PlayerStatItem[];
  onSelectPlayer?: (player: Player) => void;
}

export const LeagueStatsView: React.FC<LeagueStatsViewProps> = ({
  topScorers,
  topAssists,
  onSelectPlayer,
}) => {
  const { t } = useTranslation();
  const outlet = useOutletContext<{ setSelectedPlayer?: (player: Player | null) => void }>() || {};
  const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null);

  const handlePlayerClick = async (ps: PlayerStatItem) => {
    const pId = ps.player?.id || ps.playerId;
    if (!pId) return;

    const stringId = String(pId);
    try {
      setLoadingPlayerId(stringId);
      const fullPlayer = await playersApi.getPlayerById(stringId);
      if (fullPlayer) {
        if (onSelectPlayer) {
          onSelectPlayer(fullPlayer);
        } else if (outlet.setSelectedPlayer) {
          outlet.setSelectedPlayer(fullPlayer);
        }
      }
    } catch (err) {
      console.error('Failed to load player details for stats modal:', err);
      // Fallback nếu API lỗi mạng nhưng ps có đủ dữ liệu
      const fallbackPlayer: any = {
        id: stringId,
        first_name: ps.player?.first_name || '',
        last_name: ps.player?.last_name || ps.playerName || 'Player',
        name: ps.player?.name || ps.player?.common_name || ps.playerName,
        club: ps.club || (ps.clubName ? { name: ps.clubName } : undefined),
      };
      if (onSelectPlayer) {
        onSelectPlayer(fallbackPlayer);
      } else if (outlet.setSelectedPlayer) {
        outlet.setSelectedPlayer(fallbackPlayer);
      }
    } finally {
      setLoadingPlayerId(null);
    }
  };

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
          <span>{t('standings.top_scorers')}</span>
        </h3>
        {topScorers.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{t('standings.no_goals')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topScorers.slice(0, 10).map((ps, idx) => {
              const pId = ps.player?.id || ps.playerId;
              const stringId = pId ? String(pId) : '';
              const isLoadingThis = loadingPlayerId === stringId;
              const pName =
                ps.player?.name ||
                ps.player?.common_name ||
                `${ps.player?.first_name || ''} ${ps.player?.last_name || ''}`.trim() ||
                ps.playerName ||
                t('common.player', 'Cầu Thủ');
              const cName = ps.club?.name || ps.clubName || 'CLB';
              return (
                <div
                  key={stringId || idx}
                  onClick={() => pId && handlePlayerClick(ps)}
                  className="league-stat-player-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: idx === 0 ? '#f0fdf4' : '#f8fafc',
                    border: idx === 0 ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
                    cursor: pId ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                  }}
                  title={pId ? t('standings.view_player_detail', 'Nhấp để xem hồ sơ chi tiết cầu thủ') : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, width: '20px', color: idx === 0 ? '#15803d' : '#64748b' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span className="player-name-link">{pName}</span>
                        {isLoadingThis && <Loader2 size={13} className="animate-spin text-emerald-600" />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{cName}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#059669' }}>
                      {ps.goals || 0} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{t('stats.goals_unit', 'BÀN')}</span>
                    </div>
                    {pId && <ChevronRight size={14} color="#94a3b8" />}
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
          <span>{t('standings.top_assists')}</span>
        </h3>
        {topAssists.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{t('stats.no_assists', 'Chưa có đường kiến tạo nào được ghi nhận.')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topAssists.slice(0, 10).map((ps, idx) => {
              const pId = ps.player?.id || ps.playerId;
              const stringId = pId ? String(pId) : '';
              const isLoadingThis = loadingPlayerId === stringId;
              const pName =
                ps.player?.name ||
                ps.player?.common_name ||
                `${ps.player?.first_name || ''} ${ps.player?.last_name || ''}`.trim() ||
                ps.playerName ||
                t('common.player', 'Cầu Thủ');
              const cName = ps.club?.name || ps.clubName || 'CLB';
              return (
                <div
                  key={stringId || idx}
                  onClick={() => pId && handlePlayerClick(ps)}
                  className="league-stat-player-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: idx === 0 ? '#f0fdf4' : '#f8fafc',
                    border: idx === 0 ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
                    cursor: pId ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                  }}
                  title={pId ? t('standings.view_player_detail', 'Nhấp để xem hồ sơ chi tiết cầu thủ') : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, width: '20px', color: idx === 0 ? '#15803d' : '#64748b' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span className="player-name-link">{pName}</span>
                        {isLoadingThis && <Loader2 size={13} className="animate-spin text-emerald-600" />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{cName}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#15803d' }}>
                      {ps.assists || 0} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{t('stats.assists_unit', 'KIẾN TẠO')}</span>
                    </div>
                    {pId && <ChevronRight size={14} color="#94a3b8" />}
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
