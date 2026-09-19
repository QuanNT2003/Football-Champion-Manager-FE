import React, { useState } from 'react';
import { Player } from '../types';
import { Search, Users, Shield, Award, Zap, ChevronRight } from 'lucide-react';

interface Props {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onUpdateTransferListing: (playerId: string, isTransfer: boolean, isLoan: boolean, price?: number) => void;
}

export const SquadView: React.FC<Props> = ({ players, onSelectPlayer }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    if (player.reputation) {
      if (player.reputation > 100) return Math.min(99, Math.round(player.reputation / 100));
      return player.reputation;
    }
    return 75;
  };

  const filtered = players.filter((p) => {
    const posCode = p.position?.code || p.player_positions?.[0]?.position_code || 'MID';
    const cat = getPositionCategory(posCode);

    if (filterType !== 'ALL') {
      if (['GK', 'DEF', 'MID', 'FWD'].includes(filterType)) {
        if (cat !== filterType) return false;
      } else if (p.squad_type !== filterType) {
        return false;
      }
    }

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
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Position Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `Tất Cả (${players.length})` },
            { id: 'GK', label: 'Thủ Môn' },
            { id: 'DEF', label: 'Hậu Vệ' },
            { id: 'MID', label: 'Tiền Vệ' },
            { id: 'FWD', label: 'Tiền Đạo' },
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
            placeholder="Tìm cầu thủ theo tên..."
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

      {/* SQUAD LIST (TABLE VIEW ONLY) */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} className="text-cyan" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              DANH SÁCH CẦU THỦ CÂU LẠC BỘ ({filtered.length})
            </h3>
          </div>
        </div>

        <table className="table-hud">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Số</th>
              <th>Cầu Thủ</th>
              <th>Vị Trí</th>
              <th>Tuổi</th>
              <th>Điểm OVR</th>
              <th>Tiềm Năng</th>
              <th>Thể Lực</th>
              <th>Trạng Thái</th>
              <th>Định Giá</th>
              <th style={{ textAlign: 'right' }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  Không tìm thấy cầu thủ nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filtered.map((player) => {
                const condition = player.status?.condition ?? 90;
                const ovr = getOvrRating(player);
                const posCode = player.position?.code || player.player_positions?.[0]?.position_code || 'ST';
                const posCategory = getPositionCategory(posCode);
                const playerName = player.name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || player.common_name || 'Cầu Thủ';

                return (
                  <tr key={player.id} onClick={() => onSelectPlayer(player)} style={{ cursor: "pointer" }} title="Bấm để xem chi tiết cầu thủ">
                    <td>
                      <strong style={{ color: '#0284c7', fontFamily: 'var(--font-game)', fontSize: '1rem' }}>
                        #{player.squad_number || '-'}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#f0f9ff',
                          border: '1.5px solid #bae6fd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          flexShrink: 0
                        }}>
                          ⚽
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.95rem' }}>{playerName}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {typeof player.nationality === 'object' ? (player.nationality as any)?.name || 'Quốc tế' : (player.nationality || 'Quốc tế')}
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
                      <strong style={{ color: '#0284c7', fontFamily: 'var(--font-game)', fontSize: '1rem' }}>
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
                          Chấn Thương 🚑
                        </span>
                      ) : player.status?.is_suspended ? (
                        <span style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Treo Giò 🟥
                        </span>
                      ) : player.status?.is_transfer_listed ? (
                        <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Rao Bán 🏷️
                        </span>
                      ) : (
                        <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Sẵn Sàng
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#059669', fontFamily: 'var(--font-game)', fontSize: '0.95rem' }}>
                        €{(Number(player.market_value || 2500000) / 1000000).toFixed(1)}M
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectPlayer(player)}
                      >
                        Chi Tiết
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
