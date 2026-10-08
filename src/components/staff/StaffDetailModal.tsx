import { useTranslation } from '../../i18n';
import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Briefcase,
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
import { getFacepackUrl } from '../../utils/formatters';

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
  const { t } = useTranslation();
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
      setOfferError(t('staff.need_club_to_hire', 'Bạn cần quản lý một CLB để gửi đề nghị tuyển mộ'));
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
      setOfferSuccess(t('staff.offer_success', 'Gửi lời đề nghị tuyển mộ thành công!'));
      loadDetail(staff.id);
      if (onOfferSuccess) onOfferSuccess();
    } catch (err: any) {
      setOfferError(err.response?.data?.message || t('staff.offer_failed', 'Không thể gửi lời đề nghị, vui lòng thử lại'));
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
      setOfferSuccess(t('staff.cancel_offer_success', 'Đã hủy lời đề nghị tuyển mộ!'));
      loadDetail(staff.id);
      if (onOfferSuccess) onOfferSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy đề nghị');
    } finally {
      setCancellingOffer(false);
    }
  };

  const fullPhotoUrl = getFacepackUrl(staff.photoUrl);

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <div
        className="player-modal-dialog"
        style={{ maxWidth: '920px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="pm-topbar">
          <div className="pm-topbar-left">
            <button
              type="button"
              className="pm-nav-btn"
              disabled={!hasPrev}
              onClick={handlePrev}
              title={t('staff.prev_tooltip', 'Nhân viên trước')}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="pm-nav-btn"
              disabled={!hasNext}
              onClick={handleNext}
              title={t('staff.next_tooltip', 'Nhân viên tiếp theo')}
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="pm-player-title">{staff.name}</h2>
            <RoleBadge role={staff.staffType} />
            <LicenseBadge license={staff.coachingLicense} size="sm" />
          </div>

          <button
            type="button"
            className="pm-close-btn"
            onClick={onClose}
            title={t('staff.close_modal_tooltip', 'Đóng modal')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Staff Profile Header Card */}
        <div className="pm-header-card">
          {/* Avatar with Badges */}
          <div className="pm-avatar-container">
            <div className="pm-avatar-box">
              {fullPhotoUrl ? (
                <img
                  src={fullPhotoUrl}
                  alt={staff.name}
                  className="pm-avatar-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="pm-avatar-placeholder">
                  <span className="pm-placeholder-icon">👤</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 1: Nationality, Tactical Style, Preferred Formation */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">{t('staff.nationality_label', 'Quốc tịch:')}</span>
              <span className="pm-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {staff.countryFlag && (
                  <img src={staff.countryFlag} alt="" style={{ width: 16, height: 11, borderRadius: 2 }} />
                )}
                <span>{staff.nationality || staff.countryCode || t('common.international', 'Quốc tế')}</span>
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">{t('staff.philosophy_label', 'Triết lý:')}</span>
              <span className="pm-value pm-val-bold" style={{ color: '#16a34a' }}>
                {staff.tacticalStyle || 'BALANCED'}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">{t('staff.fav_formation_label', 'Sơ đồ ưa thích:')}</span>
              <span className="pm-value pm-val-bold">
                {staff.preferredFormation?.name || '4-3-3'}
              </span>
            </div>
          </div>

          {/* Column 2: Reputation, Current Club, Weekly Wages */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">{t('staff.reputation_label', 'Danh tiếng:')}</span>
              <div className="pm-stars-wrap">
                {renderStars(staff.reputation)}
              </div>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">{t('staff.current_club_label', 'CLB hiện tại:')}</span>
              <span className="pm-value">
                {detail?.currentContract?.club?.name || t('staff.free_agent', 'Tự do (Free Agent)')}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">{t('staff.current_wage_label', 'Lương hiện tại:')}</span>
              <span className="pm-value pm-val-bold" style={{ color: '#047857' }}>
                {formatMoney(staff.wage)} {t('staff.per_week', '/ tuần')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="pm-tabs-bar">
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Star size={15} />
            <span>{t('staff.tab_skills')}</span>
          </button>
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Briefcase size={15} />
            <span>{t('staff.tab_history')}</span>
          </button>
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'offer' ? 'active' : ''}`}
            onClick={() => setActiveTab('offer')}
          >
            <Sparkles size={15} />
            <span>{t('staff.tab_offer')}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="pm-body" style={{ maxHeight: 'calc(90vh - 240px)', overflowY: 'auto', padding: '1.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
              <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 0.75rem' }} />
              <div>{t('staff.loading_profile', 'Đang tải hồ sơ nhân sự...')}</div>
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
          title={t('staff.confirm_cancel_title', 'Xác Nhận Hủy Đề Nghị Tuyển Mộ')}
          message={t('staff.confirm_cancel_msg', 'Bạn có chắc chắn muốn hủy lời đề nghị tuyển mộ nhân sự "{name}" không? Hành động này sẽ rút lại toàn bộ đề xuất đãi ngộ.').replace('{name}', staff.name)}
          confirmText={cancellingOffer ? t('staff.cancelling', 'Đang hủy...') : t('staff.confirm_cancel_btn', 'Đồng Ý Hủy Đề Nghị')}
          cancelText={t('staff.keep_offer_btn', 'Giữ Lại Đề Nghị')}
          variant="danger"
          onConfirm={handleCancelOffer}
          onClose={() => setShowCancelConfirm(false)}
        />
      </div>
    </div>
  );
};
