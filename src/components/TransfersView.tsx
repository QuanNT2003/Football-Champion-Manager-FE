import React, { useState, useEffect } from 'react';
import { transfersApi, StaffMarketItem } from '../services/transfers.service';
import { Player, TransferOffer } from '../types';
import { ShoppingCart, DollarSign, ArrowRightLeft, Users } from 'lucide-react';

import { PlayerMarketTable } from './transfers/PlayerMarketTable';
import { StaffMarketTable } from './transfers/StaffMarketTable';
import { TransferBidsView } from './transfers/TransferBidsView';
import { PlayerOfferModal } from './transfers/PlayerOfferModal';
import { StaffHireModal } from './transfers/StaffHireModal';

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
        <PlayerMarketTable
          players={marketPlayers}
          loading={loading}
          currentClubId={currentClubId}
          search={search}
          positionFilter={positionFilter}
          page={page}
          totalPages={totalPages}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          onPositionFilterChange={(pos) => {
            setPositionFilter(pos);
            setPage(1);
          }}
          onPageChange={setPage}
          onSelectPlayer={onSelectPlayer}
          onOpenOfferModal={openOfferModal}
        />
      )}

      {/* TAB 2: NHÂN VIÊN */}
      {activeTab === 'staff' && (
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
      )}

      {/* TAB 3: ĐỀ NGHỊ CHUYỂN NHƯỢNG */}
      {activeTab === 'offers' && (
        <TransferBidsView
          incomingOffers={incomingOffers}
          outgoingOffers={outgoingOffers}
          onRespondOffer={handleRespondOffer}
        />
      )}

      {/* MODALS */}
      <PlayerOfferModal
        player={selectedPlayerForOffer}
        cashBalance={cashBalance}
        offerAmount={offerAmount}
        offerError={offerError}
        offerSuccess={offerSuccess}
        submittingOffer={submittingOffer}
        onOfferAmountChange={setOfferAmount}
        onClose={() => setSelectedPlayerForOffer(null)}
        onSubmit={handleSendOffer}
      />

      <StaffHireModal
        staff={selectedStaffForHire}
        cashBalance={cashBalance}
        hiring={hiringStaff}
        error={hireError}
        success={hireSuccess}
        onClose={() => setSelectedStaffForHire(null)}
        onConfirm={handleHireStaff}
      />
    </div>
  );
};
