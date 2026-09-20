import React from 'react';
import { Player } from '../../types';
import { Search, Filter } from 'lucide-react';
import { PositionBadge } from '../common/PositionBadge';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface PlayerMarketTableProps {
  players: Player[];
  loading: boolean;
  currentClubId: string;
  search: string;
  positionFilter: string;
  page: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onPositionFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSelectPlayer: (player: Player) => void;
  onOpenOfferModal: (player: Player) => void;
}

export const PlayerMarketTable: React.FC<PlayerMarketTableProps> = ({
  players,
  loading,
  currentClubId,
  search,
  positionFilter,
  page,
  totalPages,
  onSearchChange,
  onSearchSubmit,
  onPositionFilterChange,
  onPageChange,
  onSelectPlayer,
  onOpenOfferModal,
}) => {
  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <form onSubmit={onSearchSubmit} className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên cầu thủ hoặc quốc gia..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            className="input-select"
            value={positionFilter}
            onChange={(e) => onPositionFilterChange(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">Tất cả vị trí</option>
            <option value="GK">Thủ môn (GK)</option>
            <option value="DEF">Hậu vệ (CB/LB/RB)</option>
            <option value="MID">Tiền vệ (CM/CAM/CDM)</option>
            <option value="ATT">Tiền đạo (ST/LW/RW)</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm flex-center" style={{ gap: '0.4rem' }}>
            <Filter size={16} /> Lọc
          </button>
        </form>
      </div>

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th className="th-left" style={{ width: '25%' }}>Cầu Thủ</th>
              <th className="th-center" style={{ width: '8%' }}>Vị Trí</th>
              <th className="th-center" style={{ width: '7%' }}>Tuổi</th>
              <th className="th-center" style={{ width: '7%' }}>OVR</th>
              <th className="th-center" style={{ width: '7%' }}>POT</th>
              <th className="th-left" style={{ width: '24%' }}>CLB Hiện Tại</th>
              <th className="th-right" style={{ width: '11%' }}>Giá Thị Trường</th>
              <th className="th-center" style={{ width: '11%' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                  Đang tìm kiếm cơ sở dữ liệu chuyển nhượng...
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                  Không tìm thấy cầu thủ nào phù hợp với điều kiện tìm kiếm.
                </td>
              </tr>
            ) : (
              players.map((p) => {
                const playerName =
                  (p as any).name ||
                  p.common_name ||
                  ((p.first_name || p.last_name) ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Player');
                const pos = (p as any).position || p.player_positions?.[0]?.position_code || 'FW';
                const isOwnClub = p.club_id === currentClubId || (p as any).currentClub?.id === currentClubId;
                const value = Number(
                  (p as any).asking_price ||
                  p.market_value ||
                  p.player_financial_data?.market_value ||
                  2500000
                );
                const ovr = (p as any).ovr || p.overall_rating || 75;
                const pot = (p as any).potential || p.potential_rating || 82;
                const clubName = p.club?.name || (p as any).currentClub?.name || 'Cầu thủ Tự do';
                const nationName =
                  typeof p.nationality === 'object'
                    ? (p.nationality as any)?.name || 'Quốc tế'
                    : (p.nationality || 'Quốc tế');

                return (
                  <tr key={p.id}>
                    {/* Cột 1: Cầu Thủ */}
                    <td className="td-left">
                      <div
                        className="player-info-cell cursor-pointer"
                        onClick={() => onSelectPlayer(p)}
                      >
                        <PlayerAvatar name={playerName} position={pos} />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-bright)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={playerName}
                          >
                            {playerName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {nationName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Vị Trí */}
                    <td className="td-center">
                      <PositionBadge position={pos} />
                    </td>

                    {/* Cột 3: Tuổi */}
                    <td className="td-center" style={{ fontWeight: 600, color: '#334155' }}>
                      {p.age || 24}
                    </td>

                    {/* Cột 4: OVR */}
                    <td className="td-center">
                      <span className="ovr-chip">{ovr}</span>
                    </td>

                    {/* Cột 5: POT */}
                    <td className="td-center" style={{ color: '#d97706', fontWeight: 800, fontSize: '0.95rem' }}>
                      {pot}
                    </td>

                    {/* Cột 6: CLB Hiện Tại */}
                    <td className="td-left">
                      <div
                        style={{
                          fontWeight: 600,
                          color: clubName === 'Cầu thủ Tự do' ? 'var(--text-muted)' : 'var(--text-bright)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={clubName}
                      >
                        {clubName}
                      </div>
                      <div style={{ marginTop: '3px', display: 'flex', gap: '4px' }}>
                        {(p as any).is_free_agent ? (
                          <span className="badge badge-outline" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Tự Do</span>
                        ) : (p as any).is_loan_listed ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Cho Mượn</span>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>Niêm Yết Bán</span>
                        )}
                      </div>
                    </td>

                    {/* Cột 7: Giá Thị Trường */}
                    <td className="td-right" style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                      {formatMoney(value)}
                    </td>

                    {/* Cột 8: Thao Tác */}
                    <td className="td-center">
                      {isOwnClub ? (
                        <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>Đội Nhà</span>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ margin: '0 auto', minWidth: '76px' }}
                          onClick={() => onOpenOfferModal(p)}
                        >
                          Hỏi Mua
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex-center" style={{ justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Trang {page} / {totalPages}</span>
          <div className="btn-group">
            <button
              className="btn btn-xs btn-outline"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              Trang trước
            </button>
            <button
              className="btn btn-xs btn-outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
