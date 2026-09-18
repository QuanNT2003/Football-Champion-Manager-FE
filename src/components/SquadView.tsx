import React, { useState } from 'react';
import { Player } from '../types';
import { Search, LayoutGrid, List, Zap } from 'lucide-react';

interface Props {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onUpdateTransferListing: (playerId: string, isTransfer: boolean, isLoan: boolean, price?: number) => void;
}

export const SquadView: React.FC<Props> = ({ players, onSelectPlayer }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = players.filter((p) => {
    if (filterType !== 'ALL' && p.squad_type !== filterType) return false;
    if (searchTerm && !((p.name || p.common_name || p.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Control Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'FIRST_TEAM', 'RESERVES', 'YOUTH_U19'].map((type) => (
            <button
              key={type}
              className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'ALL' ? 'Tất Cả' : type === 'FIRST_TEAM' ? 'Đội 1 (First Team)' : type === 'RESERVES' ? 'Dự Bị (Reserves)' : 'Học Viện U19'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Toggle */}
          <div className="btn-group">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Chế độ Thẻ Bài Arcade"
            >
              <LayoutGrid size={15} />
              <span>Thẻ Bài</span>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Chế độ Bảng Số Liệu"
            >
              <List size={15} />
              <span>Bảng</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <Search size={15} color="#0284c7" />
            <input
              type="text"
              placeholder="Tìm kiếm cầu thủ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.88rem' }}
            />
          </div>
        </div>
      </div>

      {/* 1. GRID VIEW: Top Eleven / FUT Arcade Cards */}
      {viewMode === 'grid' && (
        <div className="arcade-cards-grid">
          {filtered.map((player) => {
            const condition = player.status?.condition ?? 90;
            const ovr = getOvrRating(player);
            const posCode = player.position?.code || player.player_positions?.[0]?.position_code || 'ST';
            const posCategory = getPositionCategory(posCode);
            const isGoldTier = ovr >= 80;
            const isSilverTier = ovr >= 70 && ovr < 80;

            return (
              <div
                key={player.id}
                className={`player-card-fut ${isGoldTier ? 'tier-gold' : ''}`}
                onClick={() => onSelectPlayer(player)}
              >
                {/* Top Card Bar */}
                <div className="fut-card-header">
                  {/* OVR Shield */}
                  <div className={`ovr-badge-fut ${!isGoldTier ? (isSilverTier ? 'silver' : 'bronze') : ''}`}>
                    <span className="ovr-score">{ovr}</span>
                    <span className="ovr-label">OVR</span>
                  </div>

                  {/* Position Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className={`pos-badge ${posCategory.toLowerCase()}`}>
                      {posCode}
                    </span>
                    <strong style={{ color: '#0284c7', fontFamily: 'var(--font-game)', fontSize: '0.9rem' }}>
                      #{player.squad_number || '-'}
                    </strong>
                  </div>
                </div>

                {/* Player Visual & Identity */}
                <div className="fut-card-body">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                    border: '2px solid #7dd3fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    margin: '0 auto 10px',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.15)'
                  }}>
                    ⚽
                  </div>
                  <h4 className="fut-player-name">{player.name || `${player.first_name || ''} ${player.last_name || ''}`}</h4>
                  <p className="fut-player-meta">
                    {player.age} tuổi · {typeof player.nationality === 'object' ? (player.nationality as any)?.name || 'Quốc tế' : (player.nationality || 'Quốc tế')}
                  </p>
                </div>

                {/* Stamina / Condition Bar */}
                <div className="stamina-wrapper">
                  <div className="stamina-label-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={11} color="#059669" /> THỂ LỰC
                    </span>
                    <span style={{ color: condition > 75 ? '#059669' : condition > 50 ? '#d97706' : '#dc2626' }}>
                      {condition}%
                    </span>
                  </div>
                  <div className="stamina-track">
                    <div
                      className="stamina-fill"
                      style={{
                        width: `${condition}%`,
                        background: condition > 75 ? 'linear-gradient(90deg, #10b981, #0284c7)' : condition > 50 ? 'linear-gradient(90deg, #fbbf24, #d97706)' : 'linear-gradient(90deg, #f87171, #dc2626)'
                      }}
                    />
                  </div>
                </div>

                {/* Market Value & Status Pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontFamily: 'var(--font-game)' }}>ĐỊNH GIÁ</span>
                    <strong style={{ color: '#059669', fontSize: '0.9rem', fontFamily: 'var(--font-game)' }}>
                      €{(Number(player.market_value || 2500000) / 1000000).toFixed(1)}M
                    </strong>
                  </div>

                  <div>
                    {player.status?.is_injured ? (
                      <span className="badge badge-danger">Chấn Thương</span>
                    ) : player.status?.is_suspended ? (
                      <span className="badge badge-danger">Treo Giò</span>
                    ) : player.status?.is_transfer_listed ? (
                      <span className="badge badge-warning">Rao Bán</span>
                    ) : (
                      <span className="badge badge-success">Sẵn Sàng</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. TABLE VIEW: Crisp High-Tech Football Stats */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
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
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => {
                const condition = player.status?.condition ?? 90;
                const ovr = getOvrRating(player);
                const posCode = player.position?.code || player.player_positions?.[0]?.position_code || 'ST';
                const posCategory = getPositionCategory(posCode);

                return (
                  <tr key={player.id}>
                    <td>
                      <strong style={{ color: '#0284c7', fontFamily: 'var(--font-game)' }}>
                        #{player.squad_number || '-'}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                          border: '1px solid #7dd3fc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px'
                        }}>
                          ⚽
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{player.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{typeof player.nationality === 'object' ? (player.nationality as any)?.name || 'Quốc tế' : (player.nationality || 'Quốc tế')}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pos-badge ${posCategory.toLowerCase()}`}>
                        {posCode}
                      </span>
                    </td>
                    <td>{player.age}</td>
                    <td>
                      <strong style={{ color: '#d97706', fontSize: '1.05rem', fontFamily: 'var(--font-game)' }}>
                        {ovr}
                      </strong>
                    </td>
                    <td>
                      <strong style={{ color: '#0284c7', fontFamily: 'var(--font-game)' }}>
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
                        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-game)', color: '#334155' }}>{condition}%</span>
                      </div>
                    </td>
                    <td>
                      {player.status?.is_injured ? (
                        <span className="badge badge-danger">Chấn Thương 🚑</span>
                      ) : player.status?.is_suspended ? (
                        <span className="badge badge-danger">Treo Giò 🟥</span>
                      ) : player.status?.is_transfer_listed ? (
                        <span className="badge badge-warning">Rao Bán 🏷️</span>
                      ) : (
                        <span className="badge badge-success">Sẵn Sàng</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#059669', fontFamily: 'var(--font-game)' }}>
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
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
