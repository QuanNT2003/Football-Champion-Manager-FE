import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  transfersApi,
  StaffMarketItem,
  StaffDetailResponse,
} from '../../services/transfers.service';
import { ConfirmModal } from '../common/ConfirmModal';
import { RoleBadge } from '../common/RoleBadge';
import { LicenseBadge } from '../common/LicenseBadge';
import { StaffSkillsTab } from './StaffSkillsTab';
import { StaffHistoryTab } from './StaffHistoryTab';
import { StaffOfferTab } from './StaffOfferTab';

export interface Props {
  staff: StaffMarketItem;
  staffList?: StaffMarketItem[];
  currentClubId?: string;
  cashBalance?: number;
  initialTab?: 'skills' | 'history' | 'offer';
  onClose: () => void;
  onSelectStaff?: (staff: StaffMarketItem) => void;
  onOfferSuccess?: () => void;
}

export const StaffDetailModal: React.FC<Props> = ({
  staff,
  staffList = [],
  currentClubId,
  initialTab = 'skills',
  onClose,
  onSelectStaff,
  onOfferSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'history' | 'offer'>(initialTab);
  const [detail, setDetail] = useState<StaffDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [proposedWage, setProposedWage] = useState<number>(staff.wage || 5000);
  const [contractYears, setContractYears] = useState<number>(2);
  const [signingBonus, setSigningBonus] = useState<number>(staff.signingFee || 0);
  const [roleOffered, setRoleOffered] = useState<string>(staff.staffType || 'HEAD_COACH');
  const [submittingOffer, setSubmittingOffer] = useState<boolean>(false);
  const [offerSuccess, setOfferSuccess] = useState<string>('');
  const [offerError, setOfferError] = useState<string>('');

  // Cancel Offer Confirm Modal
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [cancellingOffer, setCancellingOffer] = useState<boolean>(false);

  const loadDetail = async (staffId: string) => {
    try {
      setLoading(true);
      setOfferError('');
      setOfferSuccess('');
      const data = await transfersApi.getStaffDetail(staffId, currentClubId);
      setDetail(data);

      if (data) {
        setProposedWage(data.existingOffer?.proposed_wage || data.estimatedWage || 5000);
        setContractYears(data.existingOffer?.contract_years || 2);
        setSigningBonus(data.existingOffer?.signing_bonus || 0);
        setRoleOffered(data.existingOffer?.role_offered || data.staffType || 'HEAD_COACH');
      }
    } catch (err: any) {
      console.error('Failed to load staff detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staff.id) {
      loadDetail(staff.id);
    }
  }, [staff.id, currentClubId]);

  const currentIndex = staffList.findIndex((s) => s.id === staff.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < staffList.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectStaff) {
      onSelectStaff(staffList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectStaff) {
      onSelectStaff(staffList[currentIndex + 1]);
    }
  };

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
    return `€${val.toLocaleString()}`;
  };

  const renderStars = (reputation: number) => {
    const starCount = Math.min(5, Math.max(1, Math.round(reputation / 2000)));
    return (
      <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={13}
            style={{
              color: i <= starCount ? '#f59e0b' : '#cbd5e1',
              fill: i <= starCount ? '#f59e0b' : 'none',
            }}
          />
        ))}
      </div>
    );
  };

  const isCurrentOwnStaff = Boolean(
    currentClubId &&
    detail?.currentContract?.club?.id &&
    String(detail.currentContract.club.id) === String(currentClubId)
  );

  const handleSubmitOffer = async () => {
    if (!currentClubId) {
      setOfferError('Bạn cần quản lý một CLB để gửi đề nghị tuyển mộ');
      return;
    }
    try {
      setSubmittingOffer(true);
      setOfferError('');
      setOfferSuccess('');
      await transfersApi.makeStaffOffer({
        staff_id: staff.id,
        club_id: currentClubId,
        role_offered: roleOffered,
        proposed_wage: proposedWage,
        contract_years: contractYears,
        signing_bonus: signingBonus,
      });
      setOfferSuccess('Gửi lời đề nghị tuyển mộ thành công!');
      loadDetail(staff.id);
      if (onOfferSuccess) onOfferSuccess();
    } catch (err: any) {
      setOfferError(err.response?.data?.message || 'Không thể gửi lời đề nghị, vui lòng thử lại');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleCancelOffer = async () => {
    if (!detail?.existingOffer?.id) return;
    try {
      setCancellingOffer(true);
      await transfersApi.cancelStaffOffer(detail.existingOffer.id, currentClubId);
      setShowCancelConfirm(false);
      setOfferSuccess('Đã hủy lời đề nghị tuyển mộ!');
      loadDetail(staff.id);
      if (onOfferSuccess) onOfferSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy đề nghị');
    } finally {
      setCancellingOffer(false);
    }
  };

  return (
    <div className="player-modal-backdrop" onClick={onClose}>
      <div
        className="player-modal-container"
        style={{ maxWidth: '960px', width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="pm-header">
          <div className="pm-header-left">
            {/* Avatar & Badges */}
            <div style={{ position: 'relative' }}>
              {staff.photoUrl ? (
                <img
                  src={staff.photoUrl}
                  alt={staff.name}
                  style={{ width: 64, height: 64, borderRadius: '14px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                  }}
                >
                  {staff.name.charAt(0)}
                </div>
              )}
              <div style={{ position: 'absolute', bottom: -6, right: -6 }}>
                <LicenseBadge license={staff.coachingLicense} size="sm" />
              </div>
            </div>

            <div className="pm-name-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 className="pm-player-name" style={{ margin: 0 }}>
                  {staff.name}
                </h2>
                <RoleBadge role={staff.staffType} />
              </div>

              <div className="pm-meta-row" style={{ marginTop: '0.35rem', gap: '0.75rem' }}>
                <span className="pm-meta-item">
                  {staff.countryFlag && (
                    <img src={staff.countryFlag} alt="" style={{ width: 16, height: 11, borderRadius: 2 }} />
                  )}
                  <span>{staff.nationality || staff.countryCode}</span>
                </span>
                <span className="pm-meta-item">
                  <span>Triết lý: </span>
                  <strong style={{ color: '#16a34a' }}>{staff.tacticalStyle || 'BALANCED'}</strong>
                </span>
                <span className="pm-meta-item">
                  <span>Sơ đồ: </span>
                  <strong>{staff.preferredFormation?.name || '4-3-3'}</strong>
                </span>
                <span className="pm-meta-item">
                  <span>Danh tiếng: </span>
                  {renderStars(staff.reputation)}
                </span>
              </div>
            </div>
          </div>

          <div className="pm-header-right">
            <div className="pm-header-nav">
              <button
                type="button"
                className="pm-nav-btn"
                disabled={!hasPrev}
                onClick={handlePrev}
                title="Nhân viên trước"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="pm-nav-btn"
                disabled={!hasNext}
                onClick={handleNext}
                title="Nhân viên kế tiếp"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                className="pm-close-btn"
                onClick={onClose}
                title="Đóng modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pm-wage-box" style={{ marginTop: '0.4rem', textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Lương tuần hiện tại</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>
                {formatMoney(staff.wage)} / tuần
              </div>
            </div>
          </div>
        </div>

        {/* MODAL TABS NAVIGATION */}
        <div className="pm-tabs-bar" style={{ padding: '0 1.5rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.15rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'skills' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'skills' ? '#16a34a' : '#64748b',
            }}
            onClick={() => setActiveTab('skills')}
          >
            Chỉ Số Kỹ Năng
          </button>
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.15rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'history' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'history' ? '#16a34a' : '#64748b',
            }}
            onClick={() => setActiveTab('history')}
          >
            Lịch Sử CLB
          </button>
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'offer' ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.15rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'offer' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'offer' ? '#16a34a' : '#64748b',
            }}
            onClick={() => setActiveTab('offer')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={15} /> Đề Nghị Tuyển Mộ
            </span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="pm-body" style={{ maxHeight: 'calc(85vh - 160px)', overflowY: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 0.75rem' }} />
              <div>Đang tải hồ sơ nhân sự...</div>
            </div>
          ) : (
            <>
              {activeTab === 'skills' && <StaffSkillsTab detail={detail} />}
              {activeTab === 'history' && <StaffHistoryTab detail={detail} formatMoney={formatMoney} />}
              {activeTab === 'offer' && (
                <StaffOfferTab
                  detail={detail}
                  isCurrentOwnStaff={isCurrentOwnStaff}
                  proposedWage={proposedWage}
                  contractYears={contractYears}
                  signingBonus={signingBonus}
                  roleOffered={roleOffered}
                  submittingOffer={submittingOffer}
                  offerSuccess={offerSuccess}
                  offerError={offerError}
                  currentClubId={currentClubId}
                  formatMoney={formatMoney}
                  setProposedWage={setProposedWage}
                  setContractYears={setContractYears}
                  setSigningBonus={setSigningBonus}
                  setRoleOffered={setRoleOffered}
                  handleSubmitOffer={handleSubmitOffer}
                  onOpenCancelConfirm={() => setShowCancelConfirm(true)}
                />
              )}
            </>
          )}
        </div>

        {/* CANCEL CONFIRM MODAL */}
        <ConfirmModal
          isOpen={showCancelConfirm}
          title="Xác Nhận Hủy Đề Nghị Tuyển Mộ"
          message={`Bạn có chắc chắn muốn hủy lời đề nghị tuyển mộ nhân sự "${staff.name}" không? Hành động này sẽ rút lại toàn bộ đề xuất đãi ngộ.`}
          confirmText={cancellingOffer ? 'Đang hủy...' : 'Đồng Ý Hủy Đề Nghị'}
          cancelText="Giữ Lại Đề Nghị"
          variant="danger"
          onConfirm={handleCancelOffer}
          onClose={() => setShowCancelConfirm(false)}
        />
      </div>
    </div>
  );
};
