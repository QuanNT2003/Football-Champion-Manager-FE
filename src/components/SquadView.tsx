import { useTranslation } from '../i18n';
import { PlayerAvatar } from './common/PlayerAvatar';
import React, { useState } from 'react';
import { Player } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Search, Users, Shield, Sparkles, Award, Zap, ChevronRight } from 'lucide-react';

interface Props {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onUpdateTransferListing: (playerId: string, isTransfer: boolean, isLoan: boolean, price?: number) => void;
}

export const SquadView: React.FC<Props> = ({ players, onSelectPlayer }) => {
  const { t } = useTranslation();
  const [squadTab, setSquadTab] = useState<'ALL' | 'FIRST_TEAM' | 'YOUTH_U21' | 'RESERVES'>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const firstTeamCount = players.filter((p) => !p.squad_type || p.squad_type === 'FIRST_TEAM').length;
  const youthCount = players.filter((p) => p.squad_type === 'YOUTH_U21' || p.squad_type === 'YOUTH_U19').length;
  const reservesCount = players.filter((p) => p.squad_type === 'RESERVES').length;

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
    return 50;
  };

  const filtered = players.filter((p) => {
    // 1. Lọc theo Tuyến Đội (Squad Tab)
    if (squadTab === 'FIRST_TEAM') {
      if (p.squad_type && p.squad_type !== 'FIRST_TEAM') return false;
    } else if (squadTab === 'YOUTH_U21') {
      if (p.squad_type !== 'YOUTH_U21' && p.squad_type !== 'YOUTH_U19') return false;
    } else if (squadTab === 'RESERVES') {
      if (p.squad_type !== 'RESERVES') return false;
    }

    // 2. Lọc theo Vị Trí (Position)
    const posCode = p.position?.code || p.player_positions?.[0]?.position_code || 'MID';
    const cat = getPositionCategory(posCode);
    if (filterType !== 'ALL') {
      if (['GK', 'DEF', 'MID', 'FWD'].includes(filterType)) {
        if (cat !== filterType) return false;
      } else if (p.squad_type !== filterType) {
        return false;
      }
    }

    // 3. Tìm kiếm theo tên
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const fullName = (p.name || `${p.first_name || ''} ${p.last_name || ''}` || p.common_name || '').toLowerCase();
      if (!fullName.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="view-container squad-page-view">
      {/* Control Bar: Filters & Search */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* SQUAD LEVEL TABS (Đội Một / Đội Trẻ U21 / Đội Dự Bị) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1.5px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${squadTab === 'FIRST_TEAM' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSquadTab('FIRST_TEAM')}
              style={{
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '8px',
                ...(squadTab === 'FIRST_TEAM' ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#34d399',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                } : {})
              }}
            >
              <Shield size={14} style={{ marginRight: 5, display: 'inline' }} /> {t('squad.first_team', 'Đội Một')} ({firstTeamCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${squadTab === 'YOUTH_U21' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSquadTab('YOUTH_U21')}
              style={{
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '8px',
                ...(squadTab === 'YOUTH_U21' ? {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderColor: '#60a5fa',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                } : {})
              }}
            >
              <Sparkles size={14} style={{ marginRight: 5, display: 'inline' }} /> {t('squad.youth_team', 'Đội Trẻ U21')} ({youthCount})
            </button>
            {reservesCount > 0 && (
              <button
                type="button"
                className={`btn btn-sm ${squadTab === 'RESERVES' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSquadTab('RESERVES')}
                style={{ fontWeight: 700, padding: '7px 16px', borderRadius: '8px' }}
              >
                📋 {t('squad.reserves', 'Dự Bị')} ({reservesCount})
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {squadTab === 'FIRST_TEAM' && t('squad.first_team_desc', '🛡️ Danh sách thi đấu chính thức Đội Một')}
            {squadTab === 'YOUTH_U21' && t('squad.youth_team_desc', '🌟 Tài năng trẻ Học viện U21 & Cúp U21 Quốc Gia')}
            {squadTab === 'RESERVES' && t('squad.reserves_desc', '📋 Lực lượng dự phòng / chờ đăng ký')}
            {squadTab === 'ALL' && t('squad.all_teams_desc', '🌐 Toàn bộ danh sách cầu thủ thuộc CLB')}
          </div>
        </div>

        {/* Position Filter Pills & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `${t('squad.tab_all_positions', 'Tất Cả Vị Trí')} (${filtered.length})` },
              { id: 'GK', label: t('squad.tab_gk', 'Thủ Môn') },
              { id: 'DEF', label: t('squad.tab_def', 'Hậu Vệ') },
              { id: 'MID', label: t('squad.tab_mid', 'Tiền Vệ') },
              { id: 'FWD', label: t('squad.tab_fwd', 'Tiền Đạo') },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn btn-sm ${filterType === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterType(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="input-text"
              placeholder={t('squad.search_placeholder', 'Tìm cầu thủ theo tên...')}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.88rem',
                color: '#0f172a'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SQUAD LIST (TABLE VIEW ONLY) */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} className="text-cyan" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {t('squad.title', 'DANH SÁCH CẦU THỦ CÂU LẠC BỘ')} ({filtered.length})
            </h3>
          </div>
        </div>

        <table className="table-hud">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>{t('squad.col_number', 'SỐ')}</th>
              <th>{t('squad.col_player', 'CẦU THỦ')}</th>
              <th>{t('squad.col_position', 'VỊ TRÍ')}</th>
              <th>{t('squad.col_age', 'TUỔI')}</th>
              <th>{t('squad.col_ovr', 'ĐIỂM OVR')}</th>
              <th>{t('squad.col_potential', 'TIỀM NĂNG')}</th>
              <th>{t('squad.col_fitness', 'THỂ LỰC')}</th>
              <th>{t('squad.col_status', 'TRẠNG THÁI')}</th>
              <th>{t('squad.col_value', 'ĐỊNH GIÁ')}</th>
              <th style={{ textAlign: 'right' }}>{t('squad.col_action', 'HÀNH ĐỘNG')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  {t('squad.empty_filter', 'Không tìm thấy cầu thủ nào phù hợp bộ lọc')}
                </td>
              </tr>
            ) : (
              filtered.map((player) => {
                const condition = player.status?.condition ?? 90;
                const ovr = getOvrRating(player);
                const posCode = player.position?.code || player.player_positions?.[0]?.position_code || 'ST';
                const posCategory = getPositionCategory(posCode);
                const playerName = player.name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || player.common_name || t('common.player', 'Cầu Thủ');

                return (
                  <tr key={player.id} onClick={() => onSelectPlayer(player)} style={{ cursor: "pointer" }} title={t('squad.view_player_tooltip', 'Bấm để xem chi tiết cầu thủ')}>
                    <td>
                      <strong style={{ color: '#15803d', fontFamily: 'var(--font-game)', fontSize: '1rem' }}>
                        #{player.squad_number || '-'}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <PlayerAvatar
                          name={playerName}
                          position={posCode}
                          photoUrl={player.photo_url}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{playerName}</strong>
                            {player.squad_type === 'YOUTH_U21' && (
                              <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', background: '#dbeafe', color: '#1d4ed8', fontWeight: 800 }}>
                                {t('squad.badge_u21', '🌟 U21')}
                              </span>
                            )}
                            {player.squad_type === 'RESERVES' && (
                              <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: 700 }}>
                                {t('squad.badge_reserves', '📋 Dự bị')}
                              </span>
                            )}
                            {(!player.squad_type || player.squad_type === 'FIRST_TEAM') && (
                              <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                                {t('squad.badge_first_team', '🛡️ Đội 1')}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {typeof player.nationality === 'object' ? (player.nationality as any)?.name || t('common.international', 'Quốc tế') : (player.nationality || t('common.international', 'Quốc tế'))}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`position-tag pos-${posCategory.toLowerCase()}`}>
                        {posCode}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{player.age}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#d97706', fontSize: '1.1rem', fontFamily: 'var(--font-game)' }}>
                        {ovr}
                      </strong>
                    </td>
                    <td>
                      <strong style={{ color: '#15803d', fontFamily: 'var(--font-game)', fontSize: '1rem' }}>
                        {player.potential_rating || player.potential || 80}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '70px',
                          height: '6px',
                          background: '#e2e8f0',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${condition}%`,
                            height: '100%',
                            background: condition > 75 ? '#10b981' : condition > 50 ? '#f59e0b' : '#ef4444'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-game)', color: '#334155', fontWeight: 700 }}>
                          {condition}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {player.status?.is_injured ? (
                        <span style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t('squad.status_injured', 'Chấn Thương 🚑')}
                        </span>
                      ) : player.status?.is_suspended ? (
                        <span style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t('squad.status_suspended', 'Treo Giò 🟥')}
                        </span>
                      ) : player.status?.is_transfer_listed ? (
                        <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t('squad.status_listed', 'Rao Bán 🏷️')}
                        </span>
                      ) : (
                        <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t('squad.status_ready', 'Sẵn Sàng')}
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#059669', fontFamily: 'var(--font-game)', fontSize: '0.95rem' }}>
                        {formatCurrency(player.market_value)}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectPlayer(player)}
                      >
                        {t('common.details', 'Chi Tiết')}
                      </button>
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
