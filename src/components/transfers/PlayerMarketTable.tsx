import { useTranslation } from '../../i18n';
import React from 'react';
import { Player } from '../../types';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { PositionBadge } from '../common/PositionBadge';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface PlayerMarketTableProps {
  players: Player[];
  loading: boolean;
  currentClubId: string;
  search: string;
  statusFilter: 'ALL' | 'FREE' | 'LOAN' | 'TRANSFER';
  positionFilter: string;
  activeFilterCount: number;
  page: number;
  totalPages: number;
  totalItems?: number;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onStatusFilterChange?: (status: 'ALL' | 'FREE' | 'LOAN' | 'TRANSFER') => void;
  onPositionFilterChange?: (value: string) => void;
  onOpenSkillModal: () => void;
  onResetFilters?: () => void;
  onPageChange: (page: number) => void;
  onSelectPlayer: (player: Player) => void;
  onOpenOfferModal: (player: Player) => void;
}

export const PlayerMarketTable: React.FC<PlayerMarketTableProps> = ({
  players,
  loading,
  currentClubId,
  search,
  statusFilter,
  positionFilter,
  activeFilterCount,
  page,
  totalPages,
  totalItems,
  onSearchChange,
  onSearchSubmit,
  onOpenSkillModal,
  onResetFilters,
  onPageChange,
  onSelectPlayer,
  onOpenOfferModal,
}) => {
  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const { t } = useTranslation();

  // Tính toán danh sách số trang hiển thị dạng [1, 2, 3, '...', 10]
  const pageNumbers = React.useMemo(() => {
    const list: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else {
      list.push(1);
      if (page > 3) list.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) list.push(i);
      if (page < totalPages - 2) list.push('...');
      list.push(totalPages);
    }
    return list;
  }, [page, totalPages]);

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', borderRadius: '12px' }}>
        <form onSubmit={onSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* 1. Ô tìm kiếm tên cầu thủ */}
          <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder={t('transfers.search_placeholder_player', 'Tìm kiếm theo tên cầu thủ...')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          {/* 2. Nút Submit Tìm kiếm */}
          <button type="submit" className="btn btn-primary btn-sm flex-center" style={{ gap: '0.45rem', padding: '0.5rem 1rem' }}>
            <Search size={15} />
            <span>{t('common.search', 'Tìm kiếm')}</span>
          </button>

          {/* 3. Nút Mở Modal Bộ Lọc Chi Tiết */}
          <button
            type="button"
            onClick={onOpenSkillModal}
            className={`btn btn-sm flex-center ${activeFilterCount > 0 ? 'btn-primary' : 'btn-outline'}`}
            style={{
              gap: '0.5rem',
              padding: '0.5rem 1.1rem',
              borderColor: activeFilterCount > 0 ? '#16a34a' : '#cbd5e1',
              fontWeight: 700,
            }}
          >
            <SlidersHorizontal size={16} />
            <span>{t('market.advanced_filters_btn', 'Bộ Lọc Thị Trường')}</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '1px 7px',
                  lineHeight: '1.2',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* 4. Nút Đặt Lại Bộ Lọc Nhanh (nếu có filter active) */}
          {activeFilterCount > 0 && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="btn btn-sm btn-outline flex-center"
              style={{
                gap: '0.35rem',
                padding: '0.5rem 0.85rem',
                color: '#64748b',
                borderColor: '#e2e8f0',
              }}
              title={t('common.reset_filters', 'Xóa tất cả bộ lọc về mặc định')}
            >
              <RotateCcw size={14} />
              <span>{t('common.reset', 'Đặt lại')}</span>
            </button>
          )}
        </form>

        {/* Active Filter Chips Preview */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              {t('common.filtering_by', 'Đang lọc:')}:
            </span>

            {statusFilter && statusFilter !== 'ALL' && (
              <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                {statusFilter === 'FREE' ? '🟢 Tự do' : statusFilter === 'LOAN' ? '🟡 Cho mượn' : '🔵 Rao bán'}
              </span>
            )}

            {positionFilter && (
              <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Vị trí: {positionFilter}
              </span>
            )}

            <button
              type="button"
              onClick={onOpenSkillModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              {t('common.edit_filters', 'Chỉnh sửa bộ lọc')}
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th className="th-left" style={{ width: '25%' }}>{t('market.th_player', 'Cầu Thủ')}</th>
              <th className="th-center" style={{ width: '8%' }}>{t('market.th_pos', 'Vị Trí')}</th>
              <th className="th-center" style={{ width: '7%' }}>{t('market.th_age', 'Tuổi')}</th>
              <th className="th-center" style={{ width: '7%' }}>OVR</th>
              <th className="th-center" style={{ width: '7%' }}>POT</th>
              <th className="th-left" style={{ width: '24%' }}>{t('market.th_club', 'CLB Hiện Tại')}</th>
              <th className="th-right" style={{ width: '11%' }}>{t('market.th_price', 'Giá Thị Trường')}</th>
              <th className="th-center" style={{ width: '11%' }}>{t('market.th_actions', 'Thao Tác')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                  {t('market.searching', 'Đang tìm kiếm cơ sở dữ liệu chuyển nhượng...')}
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                  {t('market.no_results', 'Không tìm thấy cầu thủ nào phù hợp với điều kiện tìm kiếm.')}
                </td>
              </tr>
            ) : (
              players.map((p) => {
                const playerName =
                  (p as any).name ||
                  p.common_name ||
                  ((p.first_name || p.last_name) ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Player');
                const pos =
                  (typeof (p as any).position === 'string' ? (p as any).position : (p as any).position?.code) ||
                  p.player_positions?.[0]?.position?.code ||
                  p.player_positions?.[0]?.positions?.code ||
                  p.player_positions?.[0]?.position_code ||
                  'FW';
                const isOwnClub = p.club_id === currentClubId || (p as any).currentClub?.id === currentClubId;
                const value = Number(
                  (p as any).asking_price ||
                  p.market_value ||
                  p.player_financial_data?.market_value ||
                  2500000
                );
                const ovr = (p as any).ovr || p.overall_rating || 75;
                const pot = (p as any).potential || p.potential_rating || 82;
                const clubName = p.club?.name || (p as any).currentClub?.name || t('player_modal.free_agent', 'Cầu thủ Tự do');
                const nationName =
                  typeof p.nationality === 'object'
                    ? (p.nationality as any)?.name || t('common.international', 'Quốc tế')
                    : (p.nationality || t('common.international', 'Quốc tế'));

                return (
                  <tr key={p.id}>
                    {/* Cột 1: Cầu Thủ */}
                    <td className="td-left">
                      <div
                        className="player-info-cell cursor-pointer"
                        onClick={() => onSelectPlayer(p)}
                      >
                        <PlayerAvatar name={playerName} position={pos} photoUrl={p.photo_url} />
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
                          color: clubName === t('player_modal.free_agent', 'Cầu thủ Tự do') ? 'var(--text-muted)' : 'var(--text-bright)',
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
                          <span className="badge badge-outline" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{t('market.badge_free', 'Tự Do')}</span>
                        ) : (p as any).is_loan_listed ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{t('market.badge_loan', 'Cho Mượn')}</span>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{t('market.badge_listed', 'Niêm Yết Bán')}</span>
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
                        <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>{t('market.badge_home_club', 'Đội Nhà')}</span>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ margin: '0 auto', minWidth: '76px' }}
                          onClick={() => onOpenOfferModal(p)}
                        >
                          {t('bids.inquiry_buy')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination với các nút số trang 1, 2, 3... */}
        {totalPages > 0 && (
          <div
            className="flex-center"
            style={{
              justifyContent: 'space-between',
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Hiển thị số lượng cầu thủ và trang */}
            <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>
                {t('common.page_info', 'Trang {page} / {totalPages}')
                  .replace('{page}', String(page))
                  .replace('{totalPages}', String(totalPages))}
              </span>
              {totalItems !== undefined && totalItems > 0 && (
                <span style={{ color: '#94a3b8' }}>
                  ({t('common.total_players', 'Tổng cộng {total} cầu thủ').replace('{total}', Number(totalItems).toLocaleString())})
                </span>
              )}
            </div>

            {/* Danh sách các nút phân trang 1, 2, 3... */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {/* Nút về trang đầu « */}
              <button
                type="button"
                className="btn btn-xs btn-outline"
                disabled={page <= 1}
                onClick={() => onPageChange(1)}
                title={t('common.first_page', 'Trang đầu')}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: page <= 1 ? '#cbd5e1' : '#475569',
                }}
              >
                <ChevronsLeft size={15} />
              </button>

              {/* Nút Trang trước ‹ */}
              <button
                type="button"
                className="btn btn-xs btn-outline"
                disabled={page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                title={t('common.prev_page', 'Trang trước')}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: page <= 1 ? '#cbd5e1' : '#475569',
                }}
              >
                <ChevronLeft size={15} />
              </button>

              {/* Các nút số trang 1, 2, 3... */}
              {pageNumbers.map((p, idx) => {
                if (p === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{
                        padding: '0 6px',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        userSelect: 'none',
                      }}
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(p);
                const isActive = pageNum === page;

                return (
                  <button
                    key={`page-${pageNum}`}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    style={{
                      minWidth: '32px',
                      height: '30px',
                      padding: '0 6px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 800 : 600,
                      border: isActive ? '1px solid #16a34a' : '1px solid #cbd5e1',
                      background: isActive ? '#16a34a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? '0 2px 4px rgba(22, 163, 74, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Nút Trang sau › */}
              <button
                type="button"
                className="btn btn-xs btn-outline"
                disabled={page >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                title={t('common.next_page', 'Trang sau')}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: page >= totalPages ? '#cbd5e1' : '#475569',
                }}
              >
                <ChevronRight size={15} />
              </button>

              {/* Nút đến trang cuối » */}
              <button
                type="button"
                className="btn btn-xs btn-outline"
                disabled={page >= totalPages}
                onClick={() => onPageChange(totalPages)}
                title={t('common.last_page', 'Trang cuối')}
                style={{
                  minWidth: '30px',
                  height: '30px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: page >= totalPages ? '#cbd5e1' : '#475569',
                }}
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
