import React, { useState } from 'react';
import {
  Users,
  Shield,
  Sparkles,
  Search,
  Loader2,
} from 'lucide-react';
import { Player, ClubSquadGroupsResponse } from '../../types';
import { useTranslation } from '../../i18n';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  squadGroups: ClubSquadGroupsResponse | null;
  loadingSquad: boolean;
  onSelectPlayer: (player: Player) => void;
}

export const ClubPlayersTab: React.FC<Props> = ({
  squadGroups,
  loadingSquad,
  onSelectPlayer,
}) => {
  const { t } = useTranslation();
  const [squadTab, setSquadTab] = useState<'first' | 'youth'>('first');
  const [playerPosFilter, setPlayerPosFilter] = useState<string>('ALL');
  const [playerSearchTerm, setPlayerSearchTerm] = useState<string>('');

  const getPositionCategory = (posCode?: string) => {
    if (!posCode) return 'MID';
    const p = posCode.toUpperCase();
    if (p.includes('GK')) return 'GK';
    if (p.includes('CB') || p.includes('LB') || p.includes('RB') || p.includes('DF')) return 'DEF';
    if (p.includes('ST') || p.includes('CF') || p.includes('LW') || p.includes('RW') || p.includes('FW')) return 'FWD';
    return 'MID';
  };

  const getOvrRating = (player: Player) => {
    if (player.overall_rating && player.overall_rating > 0) return player.overall_rating;
    if (player.ovr && player.ovr > 0) return player.ovr;
    return 50;
  };

  const currentSquadList: Player[] =
    squadTab === 'first' ? squadGroups?.firstTeam || [] : squadGroups?.youthTeam || [];

  const filteredPlayers = currentSquadList.filter((p) => {
    const posCode = p.position?.code || p.player_positions?.[0]?.position_code || 'MID';
    const cat = getPositionCategory(posCode);

    if (playerPosFilter !== 'ALL') {
      if (cat !== playerPosFilter) return false;
    }

    if (playerSearchTerm) {
      const q = playerSearchTerm.toLowerCase();
      const fullName = (p.name || `${p.first_name || ''} ${p.last_name || ''}` || p.common_name || '').toLowerCase();
      if (!fullName.includes(q)) return false;
    }

    return true;
  });

  // Sort players by squad_number ascending (#1, #2, #3, ...)
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const numA = a.squad_number != null && Number(a.squad_number) > 0 ? Number(a.squad_number) : 9999;
    const numB = b.squad_number != null && Number(b.squad_number) > 0 ? Number(b.squad_number) : 9999;
    if (numA !== numB) return numA - numB;
    const catOrder: Record<string, number> = { GK: 1, DEF: 2, MID: 3, FWD: 4 };
    const catA = catOrder[getPositionCategory(a.position?.code || a.player_positions?.[0]?.position_code)] || 9;
    const catB = catOrder[getPositionCategory(b.position?.code || b.player_positions?.[0]?.position_code)] || 9;
    if (catA !== catB) return catA - catB;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Control Bar: Squad Toggle + Position Filter + Search */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* SQUAD LEVEL TABS (Đội Một / Đội Trẻ U21) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${squadTab === 'first' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSquadTab('first')}
              style={{
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '8px',
                ...(squadTab === 'first'
                  ? {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderColor: '#34d399',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                    }
                  : {}),
              }}
            >
              <Shield size={14} style={{ marginRight: 5, display: 'inline' }} />
              {t('club_detail.first_team')} ({squadGroups?.firstTeamCount ?? 0})
            </button>

            <button
              type="button"
              className={`btn btn-sm ${squadTab === 'youth' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSquadTab('youth')}
              style={{
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '8px',
                ...(squadTab === 'youth'
                  ? {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderColor: '#34d399',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                    }
                  : {}),
              }}
            >
              <Sparkles size={14} style={{ marginRight: 5, display: 'inline' }} />
              {t('club_detail.youth_team')} ({squadGroups?.youthTeamCount ?? 0})
            </button>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {t('club_detail.squad_total')} <strong style={{ color: '#0f172a' }}>{squadGroups?.totalPlayers ?? 0}</strong>
          </div>
        </div>

        {/* Position Filter Pills & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `${t('common.all_positions', 'Tất Cả')} (${currentSquadList.length})` },
              { id: 'GK', label: t('pos.gk', 'Thủ Môn (GK)') },
              { id: 'DEF', label: t('pos.def', 'Hậu Vệ (DEF)') },
              { id: 'MID', label: t('pos.mid', 'Tiền Vệ (MID)') },
              { id: 'FWD', label: t('pos.fwd', 'Tiền Đạo (FWD)') },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn btn-sm ${playerPosFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPlayerPosFilter(tab.id)}
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="input-text"
              placeholder={t('squad.search_placeholder', 'Tìm cầu thủ theo tên...')}
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.85rem',
                color: '#0f172a',
              }}
              value={playerSearchTerm}
              onChange={(e) => setPlayerSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SQUAD LIST (TABLE VIEW TABLE-HUD) */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px 20px' }}>
        {loadingSquad ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin text-emerald-600" style={{ margin: '0 auto 8px' }} />
            <span>{t('common.loading')}...</span>
          </div>
        ) : sortedPlayers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <Users size={40} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
            <p>{squadTab === 'first' ? t('club_detail.no_first_team') : t('club_detail.no_youth_team')}</p>
          </div>
        ) : (
          <table className="table-hud">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>{t('club_detail.col_pos', 'SỐ')}</th>
                <th>{t('club_detail.col_player', 'CẦU THỦ')}</th>
                <th>{t('club_detail.col_pos', 'VỊ TRÍ')}</th>
                <th>{t('club_detail.col_age', 'TUỔI')}</th>
                <th>{t('club_detail.col_ovr', 'OVR')}</th>
                <th>{t('club_detail.col_potential', 'TIỀM NĂNG')}</th>
                <th>{t('squad.col_fitness', 'THỂ LỰC')}</th>
                <th>{t('club_detail.col_status', 'TRẠNG THÁI')}</th>
                <th>{t('club_detail.col_value', 'ĐỊNH GIÁ')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player) => {
                const posCode = player.position?.code || player.player_positions?.[0]?.position_code || 'CM';
                const posCat = getPositionCategory(posCode);
                const ovr = getOvrRating(player);
                const playerName =
                  player.name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || player.common_name || 'Player';
                const condition = player.status?.condition ?? 95;

                return (
                  <tr
                    key={player.id}
                    onClick={() => onSelectPlayer(player)}
                    style={{ cursor: 'pointer' }}
                    className="hover:bg-emerald-50/60 transition-colors"
                    title={t('squad.view_player_detail', 'Nhấp để xem chi tiết cầu thủ {name}').replace('{name}', playerName)}
                  >
                    <td>
                      <strong style={{ color: '#15803d', fontFamily: 'var(--font-game)', fontSize: '0.95rem' }}>
                        {player.squad_number ? `#${player.squad_number}` : '-'}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <PlayerAvatar name={playerName} position={posCode} photoUrl={player.photo_url} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#0f172a', fontSize: '0.92rem' }} className="hover:text-emerald-700 transition-colors">
                              {playerName}
                            </strong>
                            {player.is_on_loan && (
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: '#fef3c7', color: '#b45309', fontWeight: 800 }}>
                                {t('club_detail.status_on_loan')}
                              </span>
                            )}
                            {player.squad_type === 'YOUTH_U21' && (
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 800 }}>
                                🌟 U21
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {typeof player.nationality === 'object'
                              ? (player.nationality as any)?.name || 'Việt Nam'
                              : player.nationality || 'Việt Nam'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`position-tag pos-${posCat.toLowerCase()}`}>
                        {posCode}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{player.age}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#d97706', fontSize: '1.05rem', fontFamily: 'var(--font-game)' }}>
                        {ovr}
                      </strong>
                    </td>
                    <td>
                      <strong style={{ color: '#15803d', fontFamily: 'var(--font-game)', fontSize: '0.95rem' }}>
                        ⭐ {player.potential_rating || player.potential || 70}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '60px', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${condition}%`,
                              height: '100%',
                              background: condition > 75 ? '#10b981' : condition > 50 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-game)', color: '#334155', fontWeight: 700 }}>
                          {condition}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {player.status?.is_injured ? (
                        <span style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t('club_detail.status_injured')} 🚑
                        </span>
                      ) : player.status?.is_suspended ? (
                        <span style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t('club_detail.status_suspended')} 🟥
                        </span>
                      ) : (
                        <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t('club_detail.status_ready')} 🟢
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-game)', color: '#0f172a' }}>
                        {formatCurrency(player.market_value)}
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
