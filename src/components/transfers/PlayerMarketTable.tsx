import { useTranslation } from '../../i18n';
import React from 'react';
import { Player } from '../../types';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
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
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onStatusFilterChange: (status: 'ALL' | 'FREE' | 'LOAN' | 'TRANSFER') => void;
  onPositionFilterChange: (value: string) => void;
  onOpenSkillModal: () => void;
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
  onSearchChange,
  onSearchSubmit,
  onStatusFilterChange,
  onPositionFilterChange,
  onOpenSkillModal,
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
  return (
    <>
      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <form onSubmit={onSearchSubmit} className="flex-center" style={{ gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* 1. Ô tìm kiếm tên / quốc gia */}
          <div className="search-bar" style={{ flex: 1, minWidth: 240 }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder={t('transfers.search_placeholder_player')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          {/* 2. Lọc theo tình trạng (Status) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <select
              className="input-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
              style={{ minWidth: '160px', fontWeight: 600 }}
              title={t('market.status_filter_tooltip', 'Tình trạng cầu thủ trên thị trường')}
            >
              <option value="ALL">{t('common.all_statuses')}</option>
              <option value="FREE">🟢 {t('transfers.status_free')}</option>
              <option value="LOAN">🟡 {t('transfers.status_loan')} (Loan)</option>
              <option value="TRANSFER">{t('market.status_transfer', '🔵 Niêm yết bán (Transfer)')}</option>
            </select>
          </div>

          {/* 3. Lọc theo Vị trí (Position) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <select
              className="input-select"
              value={positionFilter}
              onChange={(e) => onPositionFilterChange(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">{t('common.all_positions')}</option>
              <optgroup label={t('market.optgroup_lines', 'Tuyến thi đấu')}>
                <option value="GK">{t('pos.gk')}</option>
                <option value="DEF">{t('pos.def')}</option>
                <option value="MID">{t('pos.mid')}</option>
                <option value="ATT">{t('pos.fwd')}</option>
              </optgroup>
              <optgroup label={t('market.optgroup_positions', 'Vị trí cụ thể')}>
                <option value="CB">{t('pos.cb')}</option>
                <option value="LB">{t('pos.lb')}</option>
                <option value="RB">{t('pos.rb')}</option>
                <option value="CDM">{t('pos.cdm')}</option>
                <option value="CM">{t('pos.cm')}</option>
                <option value="CAM">{t('pos.cam')}</option>
                <option value="LM">{t('pos.lm')}</option>
                <option value="RM">{t('pos.rm')}</option>
                <option value="LW">{t('pos.lw')}</option>
                <option value="RW">{t('pos.rw')}</option>
                <option value="ST">{t('pos.st')}</option>
              </optgroup>
            </select>
          </div>

          {/* 4. Nút mở Popup: Bộ Lọc Nâng Cao & Kỹ Năng */}
          <button
            type="button"
            onClick={onOpenSkillModal}
            className={`btn btn-sm flex-center ${activeFilterCount > 0 ? 'btn-primary' : 'btn-outline'}`}
            style={{
              gap: '0.45rem',
              padding: '0.45rem 0.9rem',
              position: 'relative',
              borderColor: activeFilterCount > 0 ? '#16a34a' : '#cbd5e1',
            }}
            title={t('market.skill_filter_tooltip', 'Mở bộ lọc chi tiết theo 40 chỉ số FM, tuổi, giá, quốc tịch...')}
          >
            <SlidersHorizontal size={15} />
            <span>{t('market.skill_filter_btn', 'Kỹ Năng & Lọc Chi Tiết')}</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '1px 6px',
                  lineHeight: '1.2',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* 5. Nút Lọc Submit */}
          <button type="submit" className="btn btn-primary btn-sm flex-center" style={{ gap: '0.4rem' }}>
            <Filter size={16} /> {t('common.filter', 'Lọc')}
          </button>
        </form>
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

        {/* Pagination */}
        <div className="flex-center" style={{ justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Trang {page} / {totalPages}</span>
          <div className="btn-group">
            <button
              className="btn btn-xs btn-outline"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              {t('common.prev_page')}
            </button>
            <button
              className="btn btn-xs btn-outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t('common.next_page')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
