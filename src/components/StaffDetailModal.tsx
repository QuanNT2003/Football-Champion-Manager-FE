import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Briefcase,
  Calendar,
  Clock,
  Coins,
  Shield,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  HeartPulse,
  Brain,
  Search,
  Dumbbell,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  transfersApi,
  StaffMarketItem,
  StaffDetailResponse,
  StaffAttributeItem,
} from '../services/transfers.service';
import { ConfirmModal } from './common/ConfirmModal';

interface Props {
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
  cashBalance,
  initialTab = 'skills',
  onClose,
  onSelectStaff,
  onOfferSuccess,
}) => {
  const [detail, setDetail] = useState<StaffDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'history' | 'offer'>(initialTab);

  // Offer State
  const [roleOffered, setRoleOffered] = useState<string>(staff.staffType || 'HEAD_COACH');
  const [proposedWage, setProposedWage] = useState<number>(staff.wage || 5000);
  const [contractYears, setContractYears] = useState<number>(2);
  const [signingBonus, setSigningBonus] = useState<number>(staff.signingFee || 0);
  const [submittingOffer, setSubmittingOffer] = useState<boolean>(false);
  const [cancellingOffer, setCancellingOffer] = useState<boolean>(false);
  const [offerError, setOfferError] = useState<string>('');
  const [offerSuccess, setOfferSuccess] = useState<string>('');
  const [confirmCancelModal, setConfirmCancelModal] = useState<boolean>(false);

  // Load detailed staff data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setOfferError('');
    setOfferSuccess('');

    transfersApi
      .getStaffDetail(staff.id, currentClubId)
      .then((data) => {
        if (isMounted) {
          setDetail(data);
          setRoleOffered(data.staffType || 'HEAD_COACH');
          setProposedWage(data.estimatedWage || staff.wage || 5000);
          setSigningBonus(0);
          setContractYears(2);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load staff detail:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [staff.id, currentClubId]);

  // Navigate prev / next
  const currentIndex = staffList.findIndex((s) => s.id === staff.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < staffList.length - 1;

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'HEAD_COACH':
        return { label: 'HLV Trưởng', color: '#16a34a', bg: '#dcfce7' };
      case 'ASSISTANT_COACH':
        return { label: 'Trợ Lý HLV', color: '#0284c7', bg: '#e0f2fe' };
      case 'FITNESS_COACH':
        return { label: 'HLV Thể Lực', color: '#ea580c', bg: '#ffedd5' };
      case 'GOALKEEPING_COACH':
        return { label: 'HLV Thủ Môn', color: '#7c3aed', bg: '#ede9fe' };
      case 'SCOUT':
        return { label: 'Tuyển Trạch Viên', color: '#4f46e5', bg: '#e0e7ff' };
      case 'PHYSIO':
        return { label: 'Bác Sĩ / Trị Liệu', color: '#db2777', bg: '#fce7f3' };
      case 'YOUTH_DIRECTOR':
        return { label: 'GĐ Đào Tạo Trẻ', color: '#059669', bg: '#d1fae5' };
      default:
        return { label: role, color: '#475569', bg: '#f1f5f9' };
    }
  };

  const getLicenseBadge = (license: string) => {
    switch (license) {
      case 'PRO':
        return { text: 'UEFA PRO', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' };
      case 'A':
        return { text: 'BẰNG A', bg: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' };
      case 'B':
        return { text: 'BẰNG B', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff' };
      case 'C':
        return { text: 'BẰNG C', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#ffffff' };
      default:
        return { text: license, bg: '#94a3b8', color: '#ffffff' };
    }
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

  // Handle Offer
  const handleSendOffer = async () => {
    setOfferError('');
    setOfferSuccess('');

    if (!currentClubId) {
      setOfferError('Bạn cần quản lý một CLB để gửi đề nghị tuyển mộ!');
      return;
    }

    if (signingBonus > 0 && cashBalance !== undefined && signingBonus > cashBalance) {
      setOfferError(`Ngân sách CLB không đủ để chi trả khoản phí lót tay (€${signingBonus.toLocaleString()})!`);
      return;
    }

    try {
      setSubmittingOffer(true);
      const res = await transfersApi.makeStaffOffer({
        staff_id: staff.id,
        club_id: String(currentClubId),
        role_offered: roleOffered,
        proposed_wage: proposedWage,
        contract_years: contractYears,
        signing_bonus: signingBonus,
      });

      setOfferSuccess(res.message || 'Đã gửi lời đề nghị tuyển mộ thành công!');

      // Cập nhật lại existing offer trong detail
      if (detail) {
        setDetail({
          ...detail,
          existingOffer: {
            id: res.offer?.id || 'temp',
            role_offered: roleOffered,
            proposed_wage: proposedWage,
            contract_years: contractYears,
            signing_bonus: signingBonus,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        });
      }

      if (onOfferSuccess) {
        onOfferSuccess();
      }
    } catch (err: any) {
      setOfferError(err.response?.data?.message || err.message || 'Không thể gửi đề nghị.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Handle Cancel Offer
  const executeCancelOffer = async () => {
    if (!detail?.existingOffer || !currentClubId) return;
    try {
      setCancellingOffer(true);
      setOfferError('');
      await transfersApi.cancelStaffOffer(detail.existingOffer.id, String(currentClubId));
      setOfferSuccess('Đã rút lại lời đề nghị tuyển mộ thành công!');
      setDetail({
        ...detail,
        existingOffer: null,
      });
      setConfirmCancelModal(false);
      if (onOfferSuccess) {
        onOfferSuccess();
      }
    } catch (err: any) {
      setOfferError(err.response?.data?.message || err.message || 'Không thể hủy đề nghị.');
    } finally {
      setCancellingOffer(false);
    }
  };

  const sName = detail?.name || staff.name || 'Nhân sự';
  const sRole = detail?.staffType || staff.staffType || 'HEAD_COACH';
  const sLicense = detail?.coachingLicense || staff.coachingLicense || 'C';
  const sCountry = detail?.nationality?.name || staff.nationality || 'Quốc tế';
  const sCountryFlag = detail?.nationality?.flag_url || null;
  const sReputation = detail?.reputation ?? staff.reputation ?? 0;
  const sTacticalStyle = detail?.tacticalStyle || staff.tacticalStyle || 'BALANCED';
  const sFormation = detail?.preferredFormation?.name || staff.preferredFormation?.name || '4-3-3';
  const sPhoto = detail?.photoUrl || staff.photoUrl;

  const roleInfo = getRoleBadge(sRole);
  const licenseInfo = getLicenseBadge(sLicense);

  const isCurrentOwnStaff = detail?.currentContract?.club?.id === currentClubId;

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <div className="player-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        {/* Top Control Bar */}
        <div className="pm-topbar">
          <div className="pm-topbar-left">
            <button
              className="pm-nav-btn"
              onClick={handlePrev}
              title="Nhân sự trước"
              disabled={!hasPrev}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="pm-nav-btn"
              onClick={handleNext}
              title="Nhân sự tiếp theo"
              disabled={!hasNext}
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="pm-player-title">{sName}</h2>
            <span
              style={{
                background: roleInfo.bg,
                color: roleInfo.color,
                fontSize: '0.76rem',
                fontWeight: 800,
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                marginLeft: '0.5rem',
              }}
            >
              {roleInfo.label}
            </span>
          </div>

          <div className="pm-topbar-right">
            <button className="pm-close-btn" onClick={onClose} title="Đóng">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Hero Header Profile */}
        <div className="pm-header-profile" style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          {/* Avatar & License Badge */}
          <div className="pm-avatar-wrap" style={{ position: 'relative' }}>
            {sPhoto ? (
              <img src={sPhoto} alt={sName} className="pm-avatar-img" />
            ) : (
              <div
                className="pm-avatar-placeholder"
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '2rem',
                  fontWeight: 900,
                }}
              >
                {sName.charAt(0)}
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '-6px',
                background: licenseInfo.bg,
                color: licenseInfo.color,
                fontSize: '0.68rem',
                fontWeight: 900,
                padding: '0.2rem 0.45rem',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                letterSpacing: '0.5px',
              }}
            >
              {licenseInfo.text}
            </div>
          </div>

          {/* Col 1: Role, License, Nationality */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">Vai trò:</span>
              <span className="pm-value pm-val-bold">{roleInfo.label}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Bằng cấp:</span>
              <span className="pm-value pm-val-bold" style={{ color: '#0284c7' }}>
                {licenseInfo.text}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Quốc tịch:</span>
              <span className="pm-value flex-center" style={{ gap: '0.35rem' }}>
                {sCountryFlag && <img src={sCountryFlag} alt="" className="pm-flag-img" style={{ width: 18, height: 12, borderRadius: 2 }} />}
                <span>{sCountry}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Tactical Style, Formation, Reputation */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">Triết lý:</span>
              <span className="pm-value pm-val-bold" style={{ color: '#16a34a' }}>
                {sTacticalStyle}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Sơ đồ ưa thích:</span>
              <span className="pm-value pm-val-bold">{sFormation}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Danh tiếng:</span>
              <div className="pm-value flex-center" style={{ gap: '0.4rem' }}>
                <span style={{ fontWeight: 800 }}>{sReputation}</span>
                {renderStars(sReputation)}
              </div>
            </div>
          </div>

          {/* Col 3: Current Club & Wages */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">CLB Hiện tại:</span>
              <span className="pm-value pm-val-bold" style={{ color: detail?.currentContract ? '#0f172a' : '#16a34a' }}>
                {detail?.currentContract?.club?.name || 'Tự do (Free Agent)'}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Lương cam kết:</span>
              <span className="pm-value pm-val-bold" style={{ color: '#d97706' }}>
                {formatMoney(detail?.currentContract ? detail.currentContract.salary : (detail?.estimatedWage || staff.wage || 5000))} / tuần
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Trạng thái:</span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: isCurrentOwnStaff ? '#16a34a' : detail?.currentContract ? '#d97706' : '#2563eb',
                }}
              >
                {isCurrentOwnStaff
                  ? 'Đang phục vụ tại CLB'
                  : detail?.currentContract
                  ? 'Đang có hợp đồng'
                  : 'Sẵn sàng đàm phán'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pm-tabs-bar" style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 1.5rem' }}>
          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
            style={{
              padding: '0.85rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              borderBottom: activeTab === 'skills' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'skills' ? '#16a34a' : '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={16} />
            <span>Chỉ Số Năng Lực</span>
          </button>

          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.85rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              borderBottom: activeTab === 'history' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'history' ? '#16a34a' : '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Clock size={16} />
            <span>Lịch Sử CLB</span>
          </button>

          <button
            type="button"
            className={`pm-tab-btn ${activeTab === 'offer' ? 'active' : ''}`}
            onClick={() => setActiveTab('offer')}
            style={{
              padding: '0.85rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              borderBottom: activeTab === 'offer' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'offer' ? '#16a34a' : '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Briefcase size={16} />
            <span>Đề Nghị Tuyển Mộ</span>
            {detail?.existingOffer && (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                }}
              >
                ĐANG CHỜ
              </span>
            )}
          </button>
        </div>

        {/* Tab Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '55vh', flex: 1, background: '#ffffff' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 0.75rem' }} />
              <div>Đang tải hồ sơ nhân sự...</div>
            </div>
          ) : (
            <>
              {/* TAB 1: CHỈ SỐ KỸ NĂNG */}
              {activeTab === 'skills' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                    {/* 1. Coaching */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#16a34a', fontWeight: 800 }}>
                        <Dumbbell size={18} />
                        <span>Huấn Luyện (Coaching)</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {detail?.groupedAttributes.coaching.map((attr) => (
                          <AttributeRow key={attr.id} attr={attr} />
                        ))}
                        {(!detail?.groupedAttributes.coaching || detail.groupedAttributes.coaching.length === 0) && (
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Chưa có dữ liệu chỉ số huấn luyện</div>
                        )}
                      </div>
                    </div>

                    {/* 2. Mental */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#0284c7', fontWeight: 800 }}>
                        <Brain size={18} />
                        <span>Tác Phong & Tinh Thần (Mental)</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {detail?.groupedAttributes.mental.map((attr) => (
                          <AttributeRow key={attr.id} attr={attr} />
                        ))}
                        {(!detail?.groupedAttributes.mental || detail.groupedAttributes.mental.length === 0) && (
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Chưa có dữ liệu chỉ số tinh thần</div>
                        )}
                      </div>
                    </div>

                    {/* 3. Scouting */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#7c3aed', fontWeight: 800 }}>
                        <Search size={18} />
                        <span>Trinh Sát & Đánh Giá (Scouting)</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {detail?.groupedAttributes.scouting.map((attr) => (
                          <AttributeRow key={attr.id} attr={attr} />
                        ))}
                        {(!detail?.groupedAttributes.scouting || detail.groupedAttributes.scouting.length === 0) && (
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Chưa có dữ liệu chỉ số trinh sát</div>
                        )}
                      </div>
                    </div>

                    {/* 4. Medical */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#db2777', fontWeight: 800 }}>
                        <HeartPulse size={18} />
                        <span>Y Tế & Phục Hồi (Medical)</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {detail?.groupedAttributes.medical.map((attr) => (
                          <AttributeRow key={attr.id} attr={attr} />
                        ))}
                        {(!detail?.groupedAttributes.medical || detail.groupedAttributes.medical.length === 0) && (
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Chưa có dữ liệu chỉ số y tế</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LỊCH SỬ CLB */}
              {activeTab === 'history' && (
                <div>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Quá Trình Công Tác & Lịch Sử Hợp Đồng
                  </h4>

                  {detail?.contractHistory && detail.contractHistory.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {detail.contractHistory.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '8px',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                color: '#475569',
                              }}
                            >
                              {item.club?.logo_url ? (
                                <img src={item.club.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              ) : (
                                <Shield size={20} />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.club?.name || 'CLB chưa xác định'}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Từ: {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'} - Đến:{' '}
                                {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Hiện tại'}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: '#d97706' }}>{formatMoney(item.salary)} / tuần</div>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: item.status === 'ACTIVE' ? '#16a34a' : '#64748b',
                              }}
                            >
                              {item.status === 'ACTIVE' ? 'Đang công tác' : 'Đã kết thúc'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
                      Chưa có hồ sơ ghi nhận lịch sử công tác trước đây của nhân sự này.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ĐỀ NGHỊ TUYỂN MỘ */}
              {activeTab === 'offer' && (
                <div>
                  {isCurrentOwnStaff ? (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        color: '#166534',
                      }}
                    >
                      <UserCheck size={36} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Nhân Sự Này Đang Thuộc CLB Của Bạn</h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#15803d' }}>
                        Hợp đồng hiện tại đang có hiệu lực với mức lương <strong>{formatMoney(detail?.currentContract?.salary || 0)} / tuần</strong>.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Đề nghị đang chờ (nếu có) */}
                      {detail?.existingOffer && (
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '12px',
                            padding: '1rem 1.25rem',
                            marginBottom: '1.25rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 800 }}>
                              <Clock size={18} />
                              <span>Lời Đề Nghị Đang Chờ Phản Hồi</span>
                            </div>
                            <button
                              type="button"
                              disabled={cancellingOffer}
                              onClick={() => setConfirmCancelModal(true)}
                              className="btn btn-xs btn-danger"
                              style={{ padding: '0.4rem 0.85rem', fontWeight: 700 }}
                            >
                              {cancellingOffer ? 'Đang hủy...' : 'Hủy Lời Đề Nghị'}
                            </button>
                          </div>
                          <div style={{ fontSize: '0.86rem', color: '#78350f', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>Vai trò: <strong>{getRoleBadge(detail.existingOffer.role_offered).label}</strong></div>
                            <div>Lương đề xuất: <strong>{formatMoney(detail.existingOffer.proposed_wage)} / tuần</strong></div>
                            <div>Thời hạn: <strong>{detail.existingOffer.contract_years} năm</strong></div>
                            <div>Trạng thái: <strong style={{ color: '#d97706' }}>ĐANG CHỜ DUYỆT</strong></div>
                          </div>
                        </div>
                      )}

                      {/* Thông báo kết quả */}
                      {offerSuccess && (
                        <div
                          style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#166534',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                          }}
                        >
                          <CheckCircle2 size={18} color="#16a34a" />
                          <span>{offerSuccess}</span>
                        </div>
                      )}

                      {offerError && (
                        <div
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                          }}
                        >
                          <AlertCircle size={18} color="#dc2626" />
                          <span>{offerError}</span>
                        </div>
                      )}

                      {/* Form Nhập Đề Nghị Tuyển Mộ */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          Điều Khoản Hợp Đồng Đề Xuất
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                          {/* Vai trò */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                              Vai Trò Mời Đảm Nhiệm:
                            </label>
                            <select
                              value={roleOffered}
                              onChange={(e) => setRoleOffered(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontWeight: 700,
                                background: '#ffffff',
                                fontSize: '0.88rem',
                              }}
                            >
                              <option value="HEAD_COACH">HLV Trưởng (Head Coach)</option>
                              <option value="ASSISTANT_COACH">Trợ Lý HLV (Assistant Coach)</option>
                              <option value="FITNESS_COACH">HLV Thể Lực (Fitness Coach)</option>
                              <option value="GOALKEEPING_COACH">HLV Thủ Môn (GK Coach)</option>
                              <option value="SCOUT">Tuyển Trạch Viên (Scout)</option>
                              <option value="PHYSIO">Bác Sĩ / Trị Liệu (Physio)</option>
                              <option value="YOUTH_DIRECTOR">GĐ Đào Tạo Trẻ (Youth Director)</option>
                            </select>
                          </div>

                          {/* Mức Lương Tuần */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                                Lương Tuần Đề Xuất:
                              </label>
                              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                                Kỳ vọng: {formatMoney(detail?.estimatedWage || 5000)}
                              </span>
                            </div>
                            <input
                              type="number"
                              step="500"
                              min="500"
                              value={proposedWage}
                              onChange={(e) => setProposedWage(Math.max(500, Number(e.target.value) || 0))}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                color: '#0f172a',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                              {[500, 1000, 5000].map((inc) => (
                                <button
                                  key={inc}
                                  type="button"
                                  onClick={() => setProposedWage((prev) => prev + inc)}
                                  className="btn btn-xs btn-outline"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.74rem', borderRadius: '4px' }}
                                >
                                  +{formatMoney(inc)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Thời Hạn Hợp Đồng */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                              Thời Hạn Hợp Đồng:
                            </label>
                            <select
                              value={contractYears}
                              onChange={(e) => setContractYears(Number(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontWeight: 700,
                                background: '#ffffff',
                                fontSize: '0.88rem',
                              }}
                            >
                              <option value={1}>1 Năm</option>
                              <option value={2}>2 Năm (Tiêu chuẩn)</option>
                              <option value={3}>3 Năm</option>
                              <option value={4}>4 Năm</option>
                              <option value={5}>5 Năm</option>
                            </select>
                          </div>

                          {/* Phí Lót Tay (Signing Bonus) */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                              Phí Lót Tay Ký Hợp Đồng:
                            </label>
                            <input
                              type="number"
                              step="5000"
                              min="0"
                              value={signingBonus}
                              onChange={(e) => setSigningBonus(Math.max(0, Number(e.target.value) || 0))}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                color: '#0f172a',
                              }}
                            />
                          </div>
                        </div>

                        {/* Tóm tắt chi phí */}
                        <div
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.85rem 1rem',
                            marginBottom: '1.25rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1.5rem',
                            fontSize: '0.86rem',
                          }}
                        >
                          <div>
                            Lương cam kết: <strong style={{ color: '#d97706' }}>{formatMoney(proposedWage)} / tuần</strong>
                          </div>
                          <div>
                            Phí lót tay ngay: <strong style={{ color: '#0f172a' }}>{formatMoney(signingBonus)}</strong>
                          </div>
                          {cashBalance !== undefined && (
                            <div>
                              Ngân sách CLB:{' '}
                              <strong style={{ color: cashBalance >= signingBonus ? '#16a34a' : '#dc2626' }}>
                                {formatMoney(cashBalance)}
                              </strong>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={submittingOffer}
                          onClick={handleSendOffer}
                          className="btn btn-primary"
                          style={{
                            padding: '0.75rem 1.75rem',
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                          }}
                        >
                          {submittingOffer ? (
                            <>
                              <div className="spinner" style={{ width: 16, height: 16 }} />
                              <span>Đang gửi đề nghị...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={18} />
                              <span>{detail?.existingOffer ? 'Cập Nhật Lời Đề Nghị' : 'Gửi Lời Đề Nghị Tuyển Mộ'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pm-footer" style={{ padding: '0.85rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Staff ID: #{staff.id}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={onClose} style={{ borderRadius: '8px', padding: '0.45rem 1.15rem' }}>
            Đóng
          </button>
        </div>

        {/* MODAL XÁC NHẬN HỦY LỜI ĐỀ NGHỊ */}
        <ConfirmModal
          isOpen={confirmCancelModal}
          title="Xác Nhận Hủy Lời Đề Nghị Tuyển Mộ"
          variant="danger"
          confirmText="Đồng Ý Hủy"
          cancelText="Quay Lại"
          isLoading={cancellingOffer}
          onConfirm={executeCancelOffer}
          onClose={() => !cancellingOffer && setConfirmCancelModal(false)}
          message={
            <div>
              <p style={{ margin: '0 0 1rem 0', color: '#475569' }}>
                Bạn có chắc chắn muốn rút lại lời đề nghị tuyển mộ nhân sự này không?
              </p>
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.86rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div>Nhân sự: <strong style={{ color: '#0f172a' }}>{sName}</strong></div>
                <div>Vai trò mời: <strong>{getRoleBadge(detail?.existingOffer?.role_offered || sRole).label}</strong></div>
                <div>Mức lương đề xuất: <strong style={{ color: '#dc2626' }}>{formatMoney(detail?.existingOffer?.proposed_wage || proposedWage)} / tuần</strong></div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

// Row component for single attribute
const AttributeRow: React.FC<{ attr: StaffAttributeItem }> = ({ attr }) => {
  const val = attr.value;
  // Điểm số 1-100: màu sắc phân cấp
  const getColor = (v: number) => {
    if (v >= 75) return '#16a34a';
    if (v >= 60) return '#0284c7';
    if (v >= 45) return '#d97706';
    return '#94a3b8';
  };

  const color = getColor(val);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.84rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
        <span style={{ color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={attr.description}>
          {attr.name || attr.code}
        </span>
        {attr.is_key && (
          <span
            style={{
              background: '#fef3c7',
              color: '#b45309',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '0.05rem 0.35rem',
              borderRadius: '4px',
              flexShrink: 0,
            }}
          >
            KEY
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '130px', flexShrink: 0 }}>
        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, Math.max(5, val))}%`, height: '100%', background: color, borderRadius: '3px' }} />
        </div>
        <span style={{ fontWeight: 800, color, width: '24px', textAlign: 'right', fontSize: '0.86rem' }}>
          {val}
        </span>
      </div>
    </div>
  );
};
