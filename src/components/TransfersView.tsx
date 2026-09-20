import React, { useState, useEffect } from 'react';
import { transfersApi, StaffMarketItem } from '../services/transfers.service';
import { Player, TransferOffer } from '../types';
import {
  ShoppingCart,
  DollarSign,
  Search,
  Filter,
  ArrowRightLeft,
  Check,
  X,
  Users,
  UserCheck,
  ShieldAlert,
  Briefcase
} from 'lucide-react';

interface TransfersViewProps {
  currentClubId: string;
  cashBalance: number;
  onRefreshFinance: () => void;
  onSelectPlayer: (player: Player) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  currentClubId,
  cashBalance,
  onRefreshFinance,
  onSelectPlayer
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'staff' | 'offers'>('market');

  // Player Market States
  const [marketPlayers, setMarketPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Staff Market States
  const [staffList, setStaffList] = useState<StaffMarketItem[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffRoleFilter, setStaffRoleFilter] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffPage, setStaffPage] = useState(1);
  const [staffTotalPages, setStaffTotalPages] = useState(1);
  const [selectedStaffForHire, setSelectedStaffForHire] = useState<StaffMarketItem | null>(null);
  const [hiringStaff, setHiringStaff] = useState(false);
  const [hireSuccess, setHireSuccess] = useState('');
  const [hireError, setHireError] = useState('');

  // Transfer Offers States
  const [incomingOffers, setIncomingOffers] = useState<TransferOffer[]>([]);
  const [outgoingOffers, setOutgoingOffers] = useState<TransferOffer[]>([]);

  // Player Offer Modal
  const [selectedPlayerForOffer, setSelectedPlayerForOffer] = useState<Player | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [offerError, setOfferError] = useState('');
  const [offerSuccess, setOfferSuccess] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    if (activeTab === 'market') {
      loadMarket();
    } else if (activeTab === 'staff') {
      loadStaff();
    } else {
      loadOffers();
    }
  }, [activeTab, page, positionFilter, staffPage, staffRoleFilter]);

  const loadMarket = async () => {
    try {
      setLoading(true);
      const data: any = await transfersApi.getMarket({
        search: search || undefined,
        position: positionFilter || undefined,
        page,
        limit: 15
      });
      const items = data.items || (Array.isArray(data) ? data : []);
      setMarketPlayers(items);
      setTotalPages(Math.ceil((data.total || items.length) / 15) || 1);
    } catch (err) {
      console.error('Failed to load market:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      setStaffLoading(true);
      const data: any = await transfersApi.getStaffMarket({
        search: staffSearch || undefined,
        role: staffRoleFilter || undefined,
        page: staffPage,
        limit: 15
      });
      const items = data?.items || [];
      setStaffList(items);
      setStaffTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load staff market:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await transfersApi.getClubOffers(currentClubId);
      setIncomingOffers(data.incoming || []);
      setOutgoingOffers(data.outgoing || []);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMarket();
  };

  const handleStaffSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffPage(1);
    loadStaff();
  };

  const getPosCategory = (pos: string) => {
    const u = (pos || '').toUpperCase();
    if (u.includes('GK')) return 'gk';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF', 'SW'].some(k => u.includes(k))) return 'def';
    if (['CM', 'CDM', 'CAM', 'LM', 'RM', 'MID', 'DM', 'AM'].some(k => u.includes(k))) return 'mid';
    return 'fwd';
  };

  const openOfferModal = (player: Player) => {
    setSelectedPlayerForOffer(player);
    const estimated = Number(
      (player as any).asking_price ||
      player.market_value ||
      player.player_financial_data?.market_value ||
      1500000
    );
    setOfferAmount(estimated);
    setOfferError('');
    setOfferSuccess('');
  };

  const handleSendOffer = async () => {
    if (!selectedPlayerForOffer) return;
    if (offerAmount > cashBalance) {
      setOfferError('Ngân sách CLB không đủ để đặt giá chuyển nhượng này!');
      return;
    }
    try {
      setSubmittingOffer(true);
      setOfferError('');
      const targetPlayerId = (selectedPlayerForOffer as any).playerId || selectedPlayerForOffer.id;
      await transfersApi.makeOffer({
        player_id: targetPlayerId,
        buyer_club_id: currentClubId,
        offer_amount: offerAmount,
        proposed_wage: Math.round(offerAmount * 0.05)
      });
      setOfferSuccess('Đã gửi đề nghị chuyển nhượng thành công!');
      setTimeout(() => {
        setSelectedPlayerForOffer(null);
        setOfferSuccess('');
      }, 1500);
    } catch (err: any) {
      setOfferError(err.response?.data?.message || err.message || 'Không thể gửi đề nghị chuyển nhượng.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleRespondOffer = async (offerId: string, response: 'ACCEPTED' | 'REJECTED') => {
    try {
      await transfersApi.respondOffer(offerId, { response });
      loadOffers();
      onRefreshFinance();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  const openHireStaffModal = (staff: StaffMarketItem) => {
    setSelectedStaffForHire(staff);
    setHireError('');
    setHireSuccess('');
  };

  const handleHireStaff = async () => {
    if (!selectedStaffForHire) return;
    if (selectedStaffForHire.signingFee > cashBalance) {
      setHireError('Ngân sách CLB không đủ chi trả phí ký hợp đồng này!');
      return;
    }
    try {
      setHiringStaff(true);
      setHireError('');
      await transfersApi.hireStaff({
        clubId: currentClubId,
        staffId: selectedStaffForHire.id
      });
      setHireSuccess(`Tuyển dụng thành công ${selectedStaffForHire.name}!`);
      onRefreshFinance();
      setTimeout(() => {
        setSelectedStaffForHire(null);
        setHireSuccess('');
        loadStaff();
      }, 1500);
    } catch (err: any) {
      setHireError(err.response?.data?.message || err.message || 'Tuyển dụng nhân viên thất bại.');
    } finally {
      setHiringStaff(false);
    }
  };

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const getStaffRoleLabel = (role: string) => {
    switch (role) {
      case 'HEAD_COACH':
        return { label: 'HLV Trưởng', class: 'badge-role-head' };
      case 'ASSISTANT_COACH':
        return { label: 'Trợ lý HLV', class: 'badge-role-assistant' };
      case 'FITNESS_COACH':
        return { label: 'HLV Thể lực', class: 'badge-role-fitness' };
      case 'SCOUT':
        return { label: 'Tuyển trạch viên', class: 'badge-role-scout' };
      case 'PHYSIO':
        return { label: 'Bác sĩ / Y tế', class: 'badge-role-physio' };
      default:
        return { label: role, class: 'badge-outline' };
    }
  };

  const getLicenseBadge = (license: string) => {
    switch (license) {
      case 'PRO':
        return <span className="badge-license badge-license-pro">PRO</span>;
      case 'A':
        return <span className="badge-license badge-license-a">A</span>;
      case 'B':
        return <span className="badge-license badge-license-b">B</span>;
      case 'C':
        return <span className="badge-license badge-license-c">C</span>;
      default:
        return <span className="badge-license badge-license-c">{license}</span>;
    }
  };

  return (
    <div className="view-container">
      {/* Header View */}
      <div className="view-header">
        <div>
          <h1 className="view-title flex-center" style={{ gap: '0.75rem' }}>
            <ShoppingCart className="text-primary" size={28} />
            Thị Trường Chuyển Nhượng & Nhân Sự
          </h1>
          <p className="view-subtitle">
            Tìm kiếm tài năng cầu thủ, đàm phán hợp đồng chuyển nhượng và chiêu mộ ban huấn luyện chất lượng cao
          </p>
        </div>

        <div className="flex-center" style={{ gap: '1rem' }}>
          <div
            className="stat-chip"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '8px'
            }}
          >
            <DollarSign size={16} className="text-success" />
            <span>Ngân sách: <strong className="text-success">{formatMoney(cashBalance)}</strong></span>
          </div>

          <div className="btn-group">
            <button
              className={`btn btn-sm ${activeTab === 'market' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('market')}
            >
              <ShoppingCart size={15} style={{ marginRight: '0.35rem' }} />
              Cầu Thủ
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'staff' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('staff')}
            >
              <Users size={15} style={{ marginRight: '0.35rem' }} />
              Nhân Viên ({staffList.length > 0 ? staffTotalPages * 15 : 'Staff'})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'offers' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('offers')}
            >
              <ArrowRightLeft size={15} style={{ marginRight: '0.35rem' }} />
              Đề Nghị ({incomingOffers.length + outgoingOffers.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CẦU THỦ */}
      {activeTab === 'market' && (
        <>
          <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <form onSubmit={handleSearchSubmit} className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên cầu thủ hoặc quốc gia..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <select
                className="input-select"
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value);
                  setPage(1);
                }}
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
                ) : marketPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                      Không tìm thấy cầu thủ nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  marketPlayers.map((p) => {
                    const playerName =
                      (p as any).name ||
                      p.common_name ||
                      ((p.first_name || p.last_name) ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Player');
                    const pos = (p as any).position || p.player_positions?.[0]?.position_code || 'FW';
                    const posCategory = getPosCategory(pos);
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
                            style={{ justifyContent: 'flex-start', gap: '0.75rem' }}
                            onClick={() => onSelectPlayer(p)}
                          >
                            <div className={`player-avatar-sm avatar-pos-${posCategory}`}>
                              {playerName.charAt(0).toUpperCase()}
                            </div>
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
                          <span className={`pos-badge pos-${posCategory}`}>{pos}</span>
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
                              onClick={() => openOfferModal(p)}
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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Trang trước
                </button>
                <button
                  className="btn btn-xs btn-outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Trang sau
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: NHÂN VIÊN (STAFF MARKET) */}
      {activeTab === 'staff' && (
        <>
          <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <form onSubmit={handleStaffSearchSubmit} className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên nhân viên, HLV..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <select
                className="input-select"
                value={staffRoleFilter}
                onChange={(e) => {
                  setStaffRoleFilter(e.target.value);
                  setStaffPage(1);
                }}
                style={{ width: '180px' }}
              >
                <option value="">Tất cả vai trò</option>
                <option value="HEAD_COACH">HLV Trưởng</option>
                <option value="ASSISTANT_COACH">Trợ lý HLV</option>
                <option value="FITNESS_COACH">HLV Thể lực</option>
                <option value="SCOUT">Tuyển trạch viên</option>
                <option value="PHYSIO">Bác sĩ / Y tế</option>
              </select>

              <button type="submit" className="btn btn-primary btn-sm flex-center" style={{ gap: '0.4rem' }}>
                <Filter size={16} /> Lọc
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th className="th-left" style={{ width: '23%' }}>Nhân Viên</th>
                  <th className="th-center" style={{ width: '12%' }}>Vai Trò</th>
                  <th className="th-center" style={{ width: '8%' }}>Bằng Cấp</th>
                  <th className="th-left" style={{ width: '13%' }}>Triết Lý</th>
                  <th className="th-left" style={{ width: '13%' }}>Sơ Đồ Sở Trường</th>
                  <th className="th-center" style={{ width: '8%' }}>Danh Tiếng</th>
                  <th className="th-right" style={{ width: '12%' }}>Lương / Phí Tuyển</th>
                  <th className="th-center" style={{ width: '11%' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {staffLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                      <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                      Đang tìm kiếm danh sách ban huấn luyện và nhân sự...
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem' }}>
                      Không tìm thấy nhân sự phù hợp với tiêu chí tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  staffList.map((st) => {
                    const roleInfo = getStaffRoleLabel(st.staffType);
                    const isOwnClub = st.currentClub?.id === currentClubId;

                    return (
                      <tr key={st.id}>
                        {/* Nhân Viên */}
                        <td className="td-left">
                          <div className="staff-info-cell">
                            <div
                              className="player-avatar-sm"
                              style={{
                                background: '#f1f5f9',
                                border: '1.5px solid #94a3b8',
                                color: '#0f172a'
                              }}
                            >
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: 'var(--text-bright)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                                title={st.name}
                              >
                                {st.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {st.nationality || 'Quốc tế'} {st.countryCode ? `(${st.countryCode})` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vai Trò */}
                        <td className="td-center">
                          <span className={`badge-role ${roleInfo.class}`}>
                            {roleInfo.label}
                          </span>
                        </td>

                        {/* Bằng Cấp */}
                        <td className="td-center">
                          {getLicenseBadge(st.coachingLicense)}
                        </td>

                        {/* Triết Lý */}
                        <td className="td-left">
                          <span className="tactical-style-tag">
                            {st.tacticalStyle || 'BALANCED'}
                          </span>
                        </td>

                        {/* Sơ Đồ Sở Trường */}
                        <td className="td-left">
                          {st.preferredFormation ? (
                            <span style={{ fontWeight: 600, color: 'var(--text-bright)' }}>
                              {st.preferredFormation.name}
                            </span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Mặc định</span>
                          )}
                        </td>

                        {/* Danh Tiếng */}
                        <td className="td-center">
                          <span className="ovr-chip" style={{ background: '#1e293b', color: '#f59e0b', border: '1px solid #f59e0b' }}>
                            {Math.round(st.reputation / 100) || 75}
                          </span>
                        </td>

                        {/* Lương / Phí */}
                        <td className="td-right">
                          <div style={{ fontWeight: 700, color: '#059669' }}>
                            {formatMoney(st.wage)}/tuần
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Phí: {formatMoney(st.signingFee)}
                          </div>
                        </td>

                        {/* Thao Tác */}
                        <td className="td-center">
                          {isOwnClub ? (
                            <span className="badge badge-success flex-center" style={{ gap: '0.25rem', margin: '0 auto' }}>
                              <UserCheck size={12} /> Đang phục vụ
                            </span>
                          ) : (
                            <button
                              className="btn btn-sm btn-primary flex-center"
                              style={{ gap: '0.35rem', margin: '0 auto' }}
                              onClick={() => openHireStaffModal(st)}
                            >
                              <Briefcase size={14} /> Tuyển Dụng
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
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Trang {staffPage} / {staffTotalPages}</span>
              <div className="btn-group">
                <button
                  className="btn btn-xs btn-outline"
                  disabled={staffPage <= 1}
                  onClick={() => setStaffPage(p => Math.max(1, p - 1))}
                >
                  Trang trước
                </button>
                <button
                  className="btn btn-xs btn-outline"
                  disabled={staffPage >= staffTotalPages}
                  onClick={() => setStaffPage(p => p + 1)}
                >
                  Trang sau
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 3: ĐỀ NGHỊ CHUYỂN NHƯỢNG (BIDS) */}
      {activeTab === 'offers' && (
        <div className="grid-2">
          {/* Incoming Offers */}
          <div className="card">
            <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ArrowRightLeft className="text-warning" size={20} />
              Đề Nghị Mua Cầu Thủ Của Bạn ({incomingOffers.length})
            </h3>
            {incomingOffers.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Hiện chưa có đề nghị chuyển nhượng nào gửi tới.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingOffers.map((offer) => (
                  <div key={offer.id} className="offer-card">
                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                        {offer.player?.common_name || 'Cầu thủ'}
                      </span>
                      <span className="badge badge-warning">{offer.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Từ CLB: <strong>{offer.buyer_club?.name || 'Rival Club'}</strong>
                      <br />
                      Mức giá đề nghị: <strong className="text-success">{formatMoney(Number(offer.offer_amount))}</strong>
                    </div>
                    {offer.status === 'PENDING' && (
                      <div className="flex-center" style={{ gap: '0.5rem' }}>
                        <button
                          className="btn btn-xs btn-success flex-center"
                          style={{ gap: '0.25rem' }}
                          onClick={() => handleRespondOffer(offer.id, 'ACCEPTED')}
                        >
                          <Check size={14} /> Chấp Nhận Bán
                        </button>
                        <button
                          className="btn btn-xs btn-danger flex-center"
                          style={{ gap: '0.25rem' }}
                          onClick={() => handleRespondOffer(offer.id, 'REJECTED')}
                        >
                          <X size={14} /> Từ Chối
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Offers */}
          <div className="card">
            <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ShoppingCart className="text-primary" size={20} />
              Đề Nghị Mua Của Bạn Đã Gửi Đi ({outgoingOffers.length})
            </h3>
            {outgoingOffers.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Chưa có đề nghị mua nào đang chờ xử lý.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outgoingOffers.map((offer) => (
                  <div key={offer.id} className="offer-card">
                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                        {offer.player?.common_name || 'Cầu thủ mục tiêu'}
                      </span>
                      <span className={`badge ${offer.status === 'ACCEPTED' ? 'badge-success' : offer.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                        {offer.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Gửi tới CLB: <strong>{offer.seller_club?.name || 'Club'}</strong>
                      <br />
                      Mức giá bạn đặt: <strong className="text-success">{formatMoney(Number(offer.offer_amount))}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Đặt Giá Chuyển Nhượng Cầu Thủ */}
      {selectedPlayerForOffer && (
        <div className="modal-backdrop" onClick={() => setSelectedPlayerForOffer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-bright)' }}>
              Đề Nghị Mua {(selectedPlayerForOffer as any).name || selectedPlayerForOffer.common_name || selectedPlayerForOffer.last_name}
            </h3>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span className="text-muted">CLB Hiện Tại:</span>
                <span style={{ fontWeight: 600 }}>{selectedPlayerForOffer.club?.name || (selectedPlayerForOffer as any).currentClub?.name || 'Tự do'}</span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span className="text-muted">Chỉ Số Tổng Quát (OVR):</span>
                <span className="ovr-chip">{selectedPlayerForOffer.overall_rating || (selectedPlayerForOffer as any).ovr || 75}</span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-muted">Ngân Sách Hiện Có Của Bạn:</span>
                <span className="text-success" style={{ fontWeight: 700 }}>{formatMoney(cashBalance)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Mức Giá Đề Nghị (€)
              </label>
              <input
                type="number"
                className="input-text"
                style={{ width: '100%' }}
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                min={100000}
                step={50000}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-xs btn-outline" onClick={() => setOfferAmount(a => a + 500000)}>+500K</button>
                <button type="button" className="btn btn-xs btn-outline" onClick={() => setOfferAmount(a => a + 2000000)}>+2M</button>
                <button type="button" className="btn btn-xs btn-outline" onClick={() => setOfferAmount(a => Math.min(a + 5000000, cashBalance))}>+5M</button>
              </div>
            </div>

            {offerError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                {offerError}
              </div>
            )}
            {offerSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                {offerSuccess}
              </div>
            )}

            <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setSelectedPlayerForOffer(null)}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                disabled={submittingOffer}
                onClick={handleSendOffer}
              >
                {submittingOffer ? 'Đang Gửi...' : 'Xác Nhận & Gửi Đề Nghị'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tuyển Dụng Nhân Viên (Hire Staff Modal) */}
      {selectedStaffForHire && (
        <div className="modal-backdrop" onClick={() => setSelectedStaffForHire(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={22} className="text-primary" />
                Tuyển Dụng Nhân Viên
              </h3>
              <button
                onClick={() => setSelectedStaffForHire(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Họ và Tên:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedStaffForHire.name}</span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Vai Trò:</span>
                <span className={`badge-role ${getStaffRoleLabel(selectedStaffForHire.staffType).class}`}>
                  {getStaffRoleLabel(selectedStaffForHire.staffType).label}
                </span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Bằng Cấp Huấn Luyện:</span>
                <span>{getLicenseBadge(selectedStaffForHire.coachingLicense)}</span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Triết Lý:</span>
                <span className="tactical-style-tag">{selectedStaffForHire.tacticalStyle || 'BALANCED'}</span>
              </div>
              {selectedStaffForHire.preferredFormation && (
                <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="text-muted">Sơ Đồ Ưa Thích:</span>
                  <span style={{ fontWeight: 600 }}>{selectedStaffForHire.preferredFormation.name}</span>
                </div>
              )}
              <div className="flex-center" style={{ justifyContent: 'space-between' }}>
                <span className="text-muted">CLB Hiện Tại:</span>
                <span>Tự Do (Free Agent)</span>
              </div>
            </div>

            {/* Chi Phí Hợp Đồng */}
            <div style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(5, 150, 105, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#047857', fontWeight: 600 }}>Phí Ký Hợp Đồng:</span>
                <span style={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>
                  {formatMoney(selectedStaffForHire.signingFee)}
                </span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#047857', fontWeight: 600 }}>Mức Lương Tuần:</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>
                  {formatMoney(selectedStaffForHire.wage)} / tuần
                </span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span className="text-muted">Ngân Sách Hiện Có:</span>
                <span style={{ fontWeight: 700, color: cashBalance >= selectedStaffForHire.signingFee ? '#059669' : '#dc2626' }}>
                  {formatMoney(cashBalance)}
                </span>
              </div>
            </div>

            {selectedStaffForHire.staffType === 'HEAD_COACH' && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.82rem',
                  color: '#b45309',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-start'
                }}
              >
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Lưu ý:</strong> Khi bổ nhiệm HLV Trưởng mới, HLV Trưởng hiện tại của CLB sẽ tự động được thanh lý hợp đồng.
                </span>
              </div>
            )}

            {hireError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                {hireError}
              </div>
            )}
            {hireSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                {hireSuccess}
              </div>
            )}

            <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setSelectedStaffForHire(null)}>
                Hủy
              </button>
              <button
                className="btn btn-primary flex-center"
                style={{ gap: '0.4rem' }}
                disabled={hiringStaff || cashBalance < selectedStaffForHire.signingFee}
                onClick={handleHireStaff}
              >
                {hiringStaff ? 'Đang Xử Lý...' : 'Xác Nhận Ký Hợp Đồng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
