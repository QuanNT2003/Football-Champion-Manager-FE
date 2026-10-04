import { StaffDetailModal } from './StaffDetailModal';
import React, { useState, useEffect, useMemo } from 'react';
import { transfersApi, StaffMarketItem, FilterOptionsResponse } from '../services/transfers.service';
import { Player, TransferOffer } from '../types';
import { ShoppingCart, DollarSign, ArrowRightLeft, Users } from 'lucide-react';

import { PlayerMarketTable } from './transfers/PlayerMarketTable';
import { StaffMarketTable } from './transfers/StaffMarketTable';
import { ClubStaffView } from './ClubStaffView';
import { TransferBidsView } from './transfers/TransferBidsView';
import { PlayerDetailModal } from './PlayerDetailModal';
import { StaffHireModal } from './transfers/StaffHireModal';
import { PlayerSkillFilterModal, SkillFilterValues } from './transfers/PlayerSkillFilterModal';

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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FREE' | 'LOAN' | 'TRANSFER'>('ALL');
  const [positionFilter, setPositionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Advanced & Skill Filter States
  const [minAge, setMinAge] = useState<number | undefined>();
  const [maxAge, setMaxAge] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [nationalityId, setNationalityId] = useState<string>('');
  const [minOvr, setMinOvr] = useState<number | undefined>();
  const [maxOvr, setMaxOvr] = useState<number | undefined>();
  const [attributeFilters, setAttributeFilters] = useState<Record<string, number>>({});
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);

  // Staff Market States
  const [staffList, setStaffList] = useState<StaffMarketItem[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffRoleFilter, setStaffRoleFilter] = useState('');
  const [staffSubTab, setStaffSubTab] = useState<'market' | 'my_club'>('market');
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

  // Player Detail & Offer Modal
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<Player | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<'skills' | 'offer'>('skills');

  // Load filter metadata một lần khi mở view
  useEffect(() => {
    transfersApi.getFilterOptions()
      .then((res) => {
        setFilterOptions(res);
      })
      .catch((err) => {
        console.error('Không thể tải tùy chọn lọc chuyển nhượng:', err);
      });
  }, []);

  // Tính số lượng tiêu chí lọc nâng cao đang kích hoạt
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (minAge !== undefined || maxAge !== undefined) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    if (nationalityId) count++;
    if (minOvr !== undefined || maxOvr !== undefined) count++;
    for (const val of Object.values(attributeFilters)) {
      if (val > 0) count++;
    }
    return count;
  }, [minAge, maxAge, minPrice, maxPrice, nationalityId, minOvr, maxOvr, attributeFilters]);

  // Load Market data khi các filter chính thay đổi
  useEffect(() => {
    if (activeTab === 'market') {
      loadMarket();
    } else if (activeTab === 'staff') {
      loadStaff();
    } else {
      loadOffers();
    }
  }, [activeTab, page, statusFilter, positionFilter, minAge, maxAge, minPrice, maxPrice, nationalityId, minOvr, maxOvr, attributeFilters, staffPage, staffRoleFilter]);

  const loadMarket = async () => {
    try {
      setLoading(true);
      const data: any = await transfersApi.getMarket({
        search: search || undefined,
        status: statusFilter,
        position: positionFilter || undefined,
        minAge,
        maxAge,
        minPrice,
        maxPrice,
        nationalityId: nationalityId || undefined,
        minOvr,
        maxOvr,
        attributes: Object.keys(attributeFilters).length > 0 ? attributeFilters : undefined,
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

  const handleApplySkillFilters = (values: SkillFilterValues) => {
    setMinAge(values.minAge);
    setMaxAge(values.maxAge);
    setMinPrice(values.minPrice);
    setMaxPrice(values.maxPrice);
    setNationalityId(values.nationalityId || '');
    setMinOvr(values.minOvr);
    setMaxOvr(values.maxOvr);
    setAttributeFilters(values.attributes);
    setPage(1);
  };

  const handleResetSkillFilters = () => {
    setMinAge(undefined);
    setMaxAge(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setNationalityId('');
    setMinOvr(undefined);
    setMaxOvr(undefined);
    setAttributeFilters({});
    setPage(1);
  };

  const handleOpenOfferTab = (player: Player) => {
    setSelectedPlayerForDetail(player);
    setDetailInitialTab('offer');
  };

  const handleOpenDetailModal = (player: Player) => {
    setSelectedPlayerForDetail(player);
    setDetailInitialTab('skills');
  };

    const handleRespondOffer = async (offerId: string, response: 'ACCEPTED' | 'REJECTED') => {
    try {
      await transfersApi.respondOffer(offerId, { response, clubId: currentClubId });
      loadOffers();
      onRefreshFinance();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  const handleCancelOffer = async (offerId: string) => {
    try {
      await transfersApi.cancelOffer(offerId, currentClubId);
      loadOffers();
      onRefreshFinance();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Hủy lời đề nghị thất bại.');
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
              background: 'rgba(22, 163, 74, 0.1)',
              border: '1px solid rgba(22, 163, 74, 0.3)',
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
        <PlayerMarketTable
          players={marketPlayers}
          loading={loading}
          currentClubId={currentClubId}
          search={search}
          statusFilter={statusFilter}
          positionFilter={positionFilter}
          activeFilterCount={activeFilterCount}
          page={page}
          totalPages={totalPages}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          onStatusFilterChange={(st) => {
            setStatusFilter(st);
            setPage(1);
          }}
          onPositionFilterChange={(pos) => {
            setPositionFilter(pos);
            setPage(1);
          }}
          onOpenSkillModal={() => setIsSkillModalOpen(true)}
          onPageChange={setPage}
          onSelectPlayer={handleOpenDetailModal}
          onOpenOfferModal={handleOpenOfferTab}
        />
      )}

      {/* TAB 2: NHÂN VIÊN */}
      {activeTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Sub-tabs Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '10px', width: 'fit-content' }}>
            <button
              type="button"
              onClick={() => setStaffSubTab('market')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: staffSubTab === 'market' ? '#ffffff' : 'transparent',
                color: staffSubTab === 'market' ? '#0f172a' : '#64748b',
                boxShadow: staffSubTab === 'market' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              🌐 Thị Trường Tuyển Mộ
            </button>
            <button
              type="button"
              onClick={() => setStaffSubTab('my_club')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: staffSubTab === 'my_club' ? '#ffffff' : 'transparent',
                color: staffSubTab === 'my_club' ? '#0f172a' : '#64748b',
                boxShadow: staffSubTab === 'my_club' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              🏢 Ban Huấn Luyện Của Bạn
            </button>
          </div>

          {staffSubTab === 'market' ? (
            <StaffMarketTable
              staffList={staffList}
              loading={staffLoading}
              currentClubId={currentClubId}
              search={staffSearch}
              roleFilter={staffRoleFilter}
              page={staffPage}
              totalPages={staffTotalPages}
              onSearchChange={setStaffSearch}
              onSearchSubmit={handleStaffSearchSubmit}
              onRoleFilterChange={(role) => {
                setStaffRoleFilter(role);
                setStaffPage(1);
              }}
              onPageChange={setStaffPage}
              onOpenHireModal={openHireStaffModal}
            />
          ) : (
            <ClubStaffView
              clubId={currentClubId}
              cashBalance={cashBalance}
              onNavigateToMarket={() => setStaffSubTab('market')}
            />
          )}
        </div>
      )}

      {/* TAB 3: ĐỀ NGHỊ CHUYỂN NHƯỢNG */}
      {activeTab === 'offers' && (
        <TransferBidsView
          incomingOffers={incomingOffers}
          outgoingOffers={outgoingOffers}
          onRespondOffer={handleRespondOffer}
          onCancelOffer={handleCancelOffer}
          onSelectPlayer={(p) => {
            setSelectedPlayerForDetail(p);
            setDetailInitialTab('offer');
          }}
        />
      )}

      {/* MODAL 1: BỘ LỌC KỸ NĂNG & NÂNG CAO */}
      <PlayerSkillFilterModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        filterOptions={filterOptions}
        currentValues={{
          minAge,
          maxAge,
          minPrice,
          maxPrice,
          nationalityId,
          minOvr,
          maxOvr,
          attributes: attributeFilters,
        }}
        onApply={handleApplySkillFilters}
        onReset={handleResetSkillFilters}
      />

      {/* MODAL 2: CHI TIẾT CẦU THỦ & ĐỀ NGHỊ CHUYỂN NHƯỢNG (TAB OFFER) */}
      {selectedPlayerForDetail && (
        <PlayerDetailModal
          player={selectedPlayerForDetail}
          playersList={marketPlayers}
          currentClubId={currentClubId}
          cashBalance={cashBalance}
          initialTab={detailInitialTab}
          onClose={() => setSelectedPlayerForDetail(null)}
          onSelectPlayer={(p) => setSelectedPlayerForDetail(p)}
          onOfferSuccess={() => {
            loadOffers();
            onRefreshFinance();
          }}
        />
      )}

      {/* MODAL 3: TUYỂN DỤNG NHÂN VIÊN */}
      {/* MODAL CHI TIẾT & ĐỀ NGHỊ TUYỂN MỘ NHÂN SỰ */}
      {selectedStaffForHire && (
        <StaffDetailModal
          staff={selectedStaffForHire}
          staffList={staffList}
          currentClubId={currentClubId}
          cashBalance={cashBalance}
          onClose={() => setSelectedStaffForHire(null)}
          onSelectStaff={(st) => setSelectedStaffForHire(st)}
          onOfferSuccess={() => {
            loadStaff();
            loadOffers();
            onRefreshFinance();
          }}
        />
      )}
    </div>
  );
};
