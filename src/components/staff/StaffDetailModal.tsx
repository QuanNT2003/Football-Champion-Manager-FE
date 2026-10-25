import { useTranslation } from '../../i18n';
import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Briefcase,
  FileText,
} from 'lucide-react';
import {
  transfersApi,
  StaffMarketItem,
  StaffDetailResponse,
} from '../../services/transfers.service';
import { ConfirmModal } from '../common/ConfirmModal';
import { RoleBadge } from '../common/RoleBadge';
import { LicenseBadge } from '../common/LicenseBadge';
import { StaffAvatar } from '../common/StaffAvatar';
import { StaffSkillsTab } from './StaffSkillsTab';
import { StaffHistoryTab } from './StaffHistoryTab';
import { StaffOfferTab } from './StaffOfferTab';
import { StaffContractTab } from './StaffContractTab';
import { RenewContractModal } from '../common/RenewContractModal';
import { getFacepackUrl, formatCurrency } from '../../utils/formatters';

export interface Props {
  staff: StaffMarketItem;
  staffList?: StaffMarketItem[];
  currentClubId?: string;
  cashBalance?: number;
  initialTab?: 'skills' | 'history' | 'offer' | 'contract';
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
  const [activeTab, setActiveTab] = useState<'skills' | 'history' | 'offer' | 'contract'>(initialTab);
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

  // Contract Renewal & Termination Modal States
  const [showRenewModal, setShowRenewModal] = useState<boolean>(false);
  const [renewingContract, setRenewingContract] = useState<boolean>(false);
  const [showTerminateModal, setShowTerminateModal] = useState<boolean>(false);
  const [terminatingContract, setTerminatingContract] = useState<boolean>(false);

  const handleRenewStaffContract = async (data: { additionalSeasons: number; proposedWage: number }) => {
    try {
      setRenewingContract(true);
      const res = await transfersApi.renewStaffContract(staff.id, {
        additional_seasons: data.additionalSeasons,
        proposed_wage: data.proposedWage,
        club_id: currentClubId,
      });
      setShowRenewModal(false);
      await loadDetail(staff.id);
      alert(res.message || t('contract.renew_success', 'Gia hạn hợp đồng thành công!'));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || t('contract.renew_failed', 'Gia hạn hợp đồng thất bại.'));
    } finally {
      setRenewingContract(false);
    }
  };

  const handleTerminateStaffContract = async () => {
    try {
      setTerminatingContract(true);
      const res = await transfersApi.terminateStaffContract(staff.id, { club_id: currentClubId });
      setShowTerminateModal(false);
      alert(res.message || t('contract.terminate_success', 'Chấm dứt hợp đồng thành công!'));
      onOfferSuccess?.();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || t('contract.terminate_failed', 'Chấm dứt hợp đồng thất bại.'));
    } finally {
      setTerminatingContract(false);
    }
  };

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

  const isCurrentOwnStaff = Boolean(
    currentClubId &&
    detail?.currentContract?.club?.id &&
    String(detail.currentContract.club.id) === String(currentClubId)
  );

  useEffect(() => {
    if (staff.id) {
      loadDetail(staff.id);
    }
  }, [staff.id, currentClubId]);

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'contract' && !isCurrentOwnStaff) {
        setActiveTab('skills');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab, staff.id, isCurrentOwnStaff]);

  useEffect(() => {
    if (activeTab === 'contract' && !isCurrentOwnStaff) {
      setActiveTab('skills');
    }
  }, [activeTab, isCurrentOwnStaff]);

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
  const staffOvr = detail?.ovr || detail?.overall_rating || staff.ovr || staff.overall_rating || 60;
  const ovrColor = staffOvr >= 65 ? '#10b981' : staffOvr >= 55 ? '#0284c7' : '#64748b';
  const ovrBg = staffOvr >= 65 ? 'rgba(16, 185, 129, 0.15)' : staffOvr >= 55 ? 'rgba(2, 132, 199, 0.15)' : 'rgba(100, 116, 139, 0.15)';

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <div
        className="player-modal-dialog"
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
            <span
              className="ovr-chip"
              title={t('staff.ovr', 'Chỉ số OVR')}
              style={{
                background: ovrBg,
                color: ovrColor,
                border: `1.5px solid ${ovrColor}`,
                fontWeight: 900,
                fontSize: '1.05rem',
                padding: '2px 10px',
                borderRadius: '8px',
                letterSpacing: '0.5px',
              }}
            >
              {staffOvr}
            </span>
            <RoleBadge role={detail?.currentContract?.role || staff.role || staff.staffType} />
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

        {/* Two Column Layout (Left: 30-40% Basic Info & Avatar, Right: Tabs) */}
        <div className="pm-two-col-layout">
          {/* LEFT COLUMN: 30-40% BASIC INFO & AVATAR */}
          <div className="pm-left-col">
            {/* Avatar & Badges */}
            <div className="pm-left-card">
              <div className="pm-avatar-container" style={{ width: 104, height: 104, margin: '0 auto' }}>
                <StaffAvatar
                  name={staff.name}
                  role={detail?.currentContract?.role || staff.role || staff.staffType}
                  photoUrl={staff.photoUrl || detail?.photoUrl}
                  size={104}
                  style={{ borderRadius: '16px' }}
                />
              </div>

              <div style={{ marginTop: '4px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.12rem', fontWeight: 800, color: '#0f172a' }}>
                  {staff.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <RoleBadge role={detail?.currentContract?.role || staff.role || staff.staffType} />
                  <LicenseBadge license={staff.coachingLicense} size="sm" />
                </div>
              </div>
            </div>

            {/* OVR & Reputation Card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OVR</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: ovrColor, fontFamily: 'var(--font-game)' }}>{staffOvr}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{t('staff.reputation_label', 'Danh tiếng')}</span>
                <div className="pm-stars-wrap" style={{ marginTop: '4px', justifyContent: 'center', display: 'flex' }}>
                  {renderStars(staff.reputation)}
                </div>
              </div>
            </div>

            {/* Section 1: Thông tin cá nhân & Triết lý */}
            <div className="pm-left-section">
              <span className="pm-left-section-title">
                {t('staff.section_personal', 'Thông Tin & Triết Lý')}
              </span>
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
                <span className="pm-label">{t('staff.age_label', 'Tuổi & Ngày sinh:')}</span>
                <span className="pm-value pm-val-bold" style={{ color: '#0f172a' }}>
                  {t('staff.age_format', '{age} tuổi').replace('{age}', String(detail?.age || staff.age || 40))}
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>
                    ({t('common.date', 'Ngày')} {detail?.birth_season_day || staff.birth_season_day || 1})
                  </span>
                </span>
              </div>
              <div className="pm-info-row">
                <span className="pm-label">{t('staff.philosophy_label', 'Triết lý:')}</span>
                <span className="pm-value pm-val-bold" style={{ color: '#16a34a' }}>
                  {staff.tacticalStyle ? t(`staff.style_${staff.tacticalStyle.toLowerCase()}`, staff.tacticalStyle) : t('staff.style_balanced', 'Cân bằng')}
                </span>
              </div>
              <div className="pm-info-row">
                <span className="pm-label">{t('staff.fav_formation_label', 'Sơ đồ ưa thích:')}</span>
                <span className="pm-value pm-val-bold">
                  {staff.preferredFormation?.name || '4-3-3'}
                </span>
              </div>
            </div>

            {/* Section 2: CLB & Hợp Đồng */}
            <div className="pm-left-section">
              <span className="pm-left-section-title">
                {t('staff.section_contract', 'CLB & Hợp Đồng')}
              </span>
              <div className="pm-info-row">
                <span className="pm-label">{t('staff.current_club_label', 'CLB hiện tại:')}</span>
                <span className="pm-value pm-val-bold pm-team-link">
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

          {/* RIGHT COLUMN: TABS & CONTENT */}
          <div className="pm-right-col">
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
              {isCurrentOwnStaff && (
                <button
                  type="button"
                  className={`pm-tab-btn ${activeTab === 'contract' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contract')}
                >
                  <FileText size={15} />
                  <span>{t('staff.tab_contract', 'Hợp đồng')}</span>
                </button>
              )}
            </div>

            {/* Modal Body Content */}
            <div className="pm-body pm-tab-content">
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
                  {activeTab === 'contract' && (
                    <StaffContractTab
                      staff={staff}
                      detail={detail}
                      isCurrentOwnStaff={isCurrentOwnStaff}
                      onOpenRenewModal={() => setShowRenewModal(true)}
                      onOpenTerminateModal={() => setShowTerminateModal(true)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
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

        {/* RENEW CONTRACT MODAL */}
        <RenewContractModal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          title={t('contract.renew_staff_title', 'Gia Hạn Hợp Đồng Nhân Sự')}
          name={staff.name}
          currentWage={detail?.currentContract?.weekly_wage || detail?.currentContract?.salary || staff.wage || 5000}
          currentEndSeason={detail?.currentContract?.end_season_id || detail?.currentContract?.current_season || 1}
          isLoading={renewingContract}
          onConfirm={handleRenewStaffContract}
        />

        {/* TERMINATE CONTRACT CONFIRM MODAL */}
        <ConfirmModal
          isOpen={showTerminateModal}
          title={t('contract.confirm_terminate_staff_title', 'Xác Nhận Sa Thải / Chấm Dứt Hợp Đồng')}
          message={t('contract.confirm_terminate_staff_msg', 'Bạn có chắc chắn muốn sa thải nhân sự "{name}"? Hợp đồng sẽ được chấm dứt ngay lập tức và nhân sự sẽ rời khỏi CLB.').replace('{name}', staff.name)}
          confirmText={terminatingContract ? t('common.processing', 'Đang xử lý...') : t('contract.confirm_terminate_staff_btn', 'Xác Nhận Sa Thải')}
          cancelText={t('common.cancel', 'Hủy Bỏ')}
          variant="danger"
          isLoading={terminatingContract}
          onConfirm={handleTerminateStaffContract}
          onClose={() => !terminatingContract && setShowTerminateModal(false)}
        />
      </div>
    </div>
  );
};
