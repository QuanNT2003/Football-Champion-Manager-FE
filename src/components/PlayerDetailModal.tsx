import { ConfirmModal } from './common/ConfirmModal';
import React, { useState, useEffect } from 'react';
import { Player, PlayerDetailData } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { playersApi } from '../services/players.service';
import { transfersApi } from '../services/transfers.service';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Edit2,
  Coins,
  Shield,
  Award,
  AlertCircle,
  HelpCircle,
  Plus,
  ArrowRight,
  Activity,
  HeartPulse,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  player: Player;
  playersList?: Player[];
  currentClubId?: string;
  cashBalance?: number;
  initialTab?: 'skills' | 'matches' | 'statistics' | 'transfers' | 'injuries' | 'offer';
  onClose: () => void;
  onSelectPlayer?: (player: Player) => void;
  onPlayerUpdated?: () => void;
  onOfferSuccess?: () => void;
}

export const PlayerDetailModal: React.FC<Props> = ({
  player,
  playersList = [],
  currentClubId,
  cashBalance,
  initialTab,
  onClose,
  onSelectPlayer,
  onOfferSuccess,
}) => {
  const [detail, setDetail] = useState<PlayerDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [compared, setCompared] = useState<boolean>(false);
  const [skillCategory, setSkillCategory] = useState<'KEY' | 'ALL' | 'PHYSICAL' | 'TECHNICAL' | 'MENTAL' | 'GOALKEEPING'>('KEY');

  // Kiểm tra cầu thủ có thuộc CLB của người dùng không
  const isOwnClub = Boolean(
    currentClubId && (
      String(player.club_id) === String(currentClubId) ||
      String((player as any).currentClub?.id) === String(currentClubId) ||
      String((player as any).club?.id) === String(currentClubId) ||
      (detail?.club?.id ? String(detail.club.id) === String(currentClubId) : false)
    )
  );

  // Kiểm tra cầu thủ có đang trong diện chuyển nhượng (bán / mượn / tự do) không
  const isTransferListed = Boolean(
    (player as any).is_transfer_listed ||
    player.player_status?.is_transfer_listed ||
    detail?.status?.is_transfer_listed
  );

  const isLoanListed = Boolean(
    (player as any).is_loan_listed ||
    player.player_status?.is_loan_listed ||
    detail?.status?.is_loan_listed
  );

  const isFreeAgent = Boolean(
    (player as any).is_free_agent ||
    (!player.club_id && !(player as any).currentClub?.id && !(player as any).club?.id) ||
    (detail !== null && !detail.club)
  );

  // Chỉ hiển thị tab Offer khi: Cầu thủ KHÔNG thuộc CLB của mình VÀ đang trong diện chuyển nhượng
  const isEligibleForOffer = !isOwnClub && (isTransferListed || isLoanListed || isFreeAgent);

  const [activeTab, setActiveTab] = useState<'skills' | 'matches' | 'statistics' | 'transfers' | 'injuries' | 'offer'>(() => {
    if (initialTab === 'offer') {
      return isEligibleForOffer ? 'offer' : 'skills';
    }
    return initialTab || 'skills';
  });

  useEffect(() => {
    if (initialTab === 'offer') {
      if (isEligibleForOffer) {
        setActiveTab('offer');
      } else {
        setActiveTab('skills');
      }
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isEligibleForOffer]);

  useEffect(() => {
    if (activeTab === 'offer' && !isEligibleForOffer) {
      setActiveTab('skills');
    }
  }, [isEligibleForOffer, activeTab]);

  // Offer State
  const [isLoan, setIsLoan] = useState<boolean>(false);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [proposedWage, setProposedWage] = useState<number>(0);
  const [contractYears, setContractYears] = useState<number>(3);
  const [offerSubmitting, setOfferSubmitting] = useState<boolean>(false);
  const [offerError, setOfferError] = useState<string>('');
  const [offerSuccess, setOfferSuccess] = useState<string>('');
  const [existingOffer, setExistingOffer] = useState<any>(null);
  const [loadingOffer, setLoadingOffer] = useState<boolean>(false);
  const [cancellingOffer, setCancellingOffer] = useState<boolean>(false);
  const [confirmCancelModal, setConfirmCancelModal] = useState<boolean>(false);

  useEffect(() => {
    const marketVal = Number(
      (player as any).asking_price ||
      player.market_value ||
      (player as any).player_financial_data?.market_value ||
      2500000
    );
    setOfferAmount(marketVal);
    const defaultWage = Math.round(Math.max(1000, marketVal * 0.005));
    setProposedWage(defaultWage);
    setContractYears(3);
    setIsLoan(false);
    setOfferError('');
    setOfferSuccess('');
    setExistingOffer(null);

    if (isEligibleForOffer && currentClubId && player?.id) {
      setLoadingOffer(true);
      transfersApi
        .getPlayerOffer(String(currentClubId), String(player.id))
        .then((prevOffer) => {
          if (prevOffer) {
            setExistingOffer(prevOffer);
            setIsLoan(Boolean(prevOffer.is_loan));
            if (prevOffer.offer_amount !== undefined) {
              setOfferAmount(Number(prevOffer.offer_amount));
            }
            if (prevOffer.proposed_wage !== undefined) {
              setProposedWage(Number(prevOffer.proposed_wage));
            }
            if (prevOffer.contract_years !== undefined) {
              setContractYears(Number(prevOffer.contract_years));
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load previous offer:', err);
        })
        .finally(() => {
          setLoadingOffer(false);
        });
    }
  }, [player, currentClubId, isEligibleForOffer]);

  const handleOpenCancelConfirm = () => {
    setOfferError('');
    setConfirmCancelModal(true);
  };

  const executeCancelOffer = async () => {
    if (!existingOffer || !currentClubId) return;
    try {
      setCancellingOffer(true);
      setOfferError('');
      await transfersApi.cancelOffer(existingOffer.id, String(currentClubId));
      setOfferSuccess('Đã hủy lời đề nghị chuyển nhượng thành công!');
      setExistingOffer({ ...existingOffer, status: 'CANCELLED' });
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

  const handleSendOffer = async () => {
    setOfferError('');
    setOfferSuccess('');

    if (!currentClubId) {
      setOfferError('Bạn cần quản lý một CLB để gửi đề nghị chuyển nhượng!');
      return;
    }
    if (!isLoan && cashBalance !== undefined && offerAmount > cashBalance) {
      setOfferError(`Ngân sách CLB không đủ! Bạn hiện có €${cashBalance.toLocaleString()}, trong khi phí chuyển nhượng đề xuất là €${offerAmount.toLocaleString()}. Vui lòng giảm mức giá hoặc chọn mượn cầu thủ.`);
      return;
    }
    const targetPlayerId = (player as any).playerId || player.id;
    const targetClubId = (player as any).currentClub?.id || player.club_id || (player as any).club?.id;
    if (!targetClubId) {
      setOfferError('Không xác định được CLB chủ quản của cầu thủ.');
      return;
    }

    try {
      setOfferSubmitting(true);
      await transfersApi.makeOffer({
        player_id: String(targetPlayerId),
        to_club_id: String(targetClubId),
        offer_amount: isLoan ? 0 : offerAmount,
        is_loan: isLoan,
        proposed_wage: proposedWage,
        contract_years: contractYears,
      });

      setOfferSuccess(
        isLoan
          ? 'Đã gửi lời đề nghị mượn cầu thủ thành công tới CLB chủ quản!'
          : 'Đã gửi lời đề nghị mua đứt cầu thủ thành công tới CLB chủ quản!'
      );
      setExistingOffer({
        status: 'PENDING',
        is_loan: isLoan,
        offer_amount: isLoan ? 0 : offerAmount,
      });

      if (onOfferSuccess) {
        onOfferSuccess();
      }
    } catch (err: any) {
      setOfferError(err.response?.data?.message || err.message || 'Không thể gửi đề nghị chuyển nhượng.');
    } finally {
      setOfferSubmitting(false);
    }
  };

  // Load detailed player info from API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    playersApi
      .getPlayerById(player.id)
      .then((data: any) => {
        if (isMounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load player detail:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [player.id]);

  // Navigate to previous / next player in squad
  const currentIndex = playersList.findIndex((p) => p.id === player.id);
  const hasPrev = playersList.length > 1;
  const hasNext = playersList.length > 1;

  const handlePrev = () => {
    if (!onSelectPlayer || playersList.length <= 1) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : playersList.length - 1;
    onSelectPlayer(playersList[prevIdx]);
  };

  const handleNext = () => {
    if (!onSelectPlayer || playersList.length <= 1) return;
    const nextIdx = currentIndex < playersList.length - 1 ? currentIndex + 1 : 0;
    onSelectPlayer(playersList[nextIdx]);
  };

  // Get skills dynamically based on DB attributes & position key attributes
  const getDisplayedSkills = () => {
    if (!detail?.skills) {
      return { left: [], right: [], total: 0, label: 'Chỉ số cốt lõi' };
    }

    let list: any[] = [];
    let label = 'Chỉ số cốt lõi vị trí (10)';

    if (skillCategory === 'KEY') {
      list = (detail.skills.key_attributes && detail.skills.key_attributes.length > 0)
        ? detail.skills.key_attributes
        : [...(detail.skills.left_column || []), ...(detail.skills.right_column || [])];
      label = `Chỉ số cốt lõi vị trí (${list.length})`;
    } else if (skillCategory === 'PHYSICAL') {
      list = detail.skills.categories?.physical || [];
      label = `Thể chất - Physical (${list.length})`;
    } else if (skillCategory === 'TECHNICAL') {
      list = detail.skills.categories?.technical || [];
      label = `Kỹ thuật - Technical (${list.length})`;
    } else if (skillCategory === 'MENTAL') {
      list = detail.skills.categories?.mental || [];
      label = `Tâm lý & Nhận thức - Mental (${list.length})`;
    } else if (skillCategory === 'GOALKEEPING') {
      list = detail.skills.categories?.goalkeeping || [];
      label = `Kỹ năng Thủ môn - Goalkeeping (${list.length})`;
    } else {
      list = detail.skills.all_attributes || [];
      label = `Tất cả chỉ số (${list.length})`;
    }

    const half = Math.ceil(list.length / 2);
    const left = list.slice(0, half);
    const right = list.slice(half);
    const total = list.reduce((acc: number, a: any) => acc + (Number(a.value) || 0), 0);

    return { left, right, total, label };
  };

  const displayedSkills = getDisplayedSkills();

  // Basic info from DB
  const pName = detail?.name || `${player.first_name} ${player.last_name}`.trim();
  const pAge = detail?.age ?? player.age ?? 20;
  const pPos = detail?.primary_position?.name || detail?.position?.name || player.position?.name || 'Cầu thủ';
  const pPosCode = detail?.primary_position?.code || detail?.position?.code || player.position?.code || '-';
  
  // Chiều cao & Cân nặng chuẩn hóa từ DB
  const rawHeight = detail?.height || (player as any).height;
  const pHeight = rawHeight && rawHeight !== '-' 
    ? `${Math.round(parseFloat(String(rawHeight).replace(/[^\d.]/g, '')))} cm` 
    : '-';

  const rawWeight = detail?.weight || (player as any).weight;
  const pWeight = rawWeight && rawWeight !== '-' 
    ? `${Math.round(parseFloat(String(rawWeight).replace(/[^\d.]/g, '')))} kg` 
    : '-';

  // Chân thuận
  const rawFoot = (detail?.preferred_foot || (player as any).preferred_foot || 'RIGHT').toUpperCase();
  const pFoot = rawFoot === 'LEFT' ? 'Left (Trái)' : rawFoot === 'BOTH' ? 'Both (Hai chân)' : 'Right (Phải)';

  // Danh tiếng & Tiềm năng
  const pReputation = detail?.reputation ?? player.reputation ?? 0;
  const pPotential = detail?.potential ?? player.potential ?? 0;

  // Điểm OVR / Average Quality
  const pQuality = (detail?.average_quality ?? player.overall_rating ?? 50.0).toFixed(2);
  const pClubName = detail?.club?.name || player.club?.name || 'Tự do';
  const pCountry = typeof detail?.nationality === 'object'
    ? (detail?.nationality as any)?.name
    : typeof player.nationality === 'object'
    ? (player.nationality as any)?.name
    : (detail?.nationality || player.nationality || '-');
  const pShirtNo = detail?.squad_number ?? player.squad_number ?? 1;

  // Giá trị thị trường và Lương tuần dùng chung hàm formatCurrency duy nhất
  const pMarketValue = detail?.market_value ?? player.market_value;
  const pWorth = formatCurrency(pMarketValue);

  const pWeeklyWage = (detail as any)?.weekly_wage ?? (player.contract?.salary ? Math.round(Number(player.contract.salary) / 52) : null);
  const pWages = pWeeklyWage && pWeeklyWage > 0 
    ? `${formatCurrency(pWeeklyWage)} / tuần` 
    : (detail?.weekly_wages_display || 'Chưa ký HĐ');

  // Hiển thị sao tiềm năng theo thang chuẩn 1-100 (mỗi 20 điểm = 1 sao)
  const renderStars = (pot: number) => {
    const starCount = pot > 5 ? Math.min(5, Math.max(1, Math.round(pot / 20))) : Math.max(1, pot);
    const list = [];
    for (let i = 1; i <= 5; i++) {
      list.push(
        <span key={i} className={i <= starCount ? 'star-gold' : 'star-muted'}>
          ★
        </span>
      );
    }
    return list;
  };

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <div className="player-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="pm-topbar">
          <div className="pm-topbar-left">
            <button
              className="pm-nav-btn"
              onClick={handlePrev}
              title="Cầu thủ trước"
              disabled={!hasPrev}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="pm-nav-btn"
              onClick={handleNext}
              title="Cầu thủ tiếp theo"
              disabled={!hasNext}
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="pm-player-title">{pName}</h2>
            <button className="pm-icon-btn" title="Chỉnh sửa tên / biệt danh">
              <Edit2 size={16} />
            </button>
            <button
              className={`pm-icon-btn ${isFavorite ? 'fav-active' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
              title="Đánh dấu yêu thích"
            >
              <Star size={17} fill={isFavorite ? '#eab308' : 'none'} color={isFavorite ? '#eab308' : '#64748b'} />
            </button>
          </div>

          <button className="pm-close-btn" onClick={onClose} title="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Player Profile Header Card */}
        <div className="pm-header-card">
          {/* Avatar with Shirt Badge */}
          <div className="pm-avatar-container">
            <div className="pm-avatar-box">
              {detail?.photo_url || player.photo_url ? (
                <img
                  src={detail?.photo_url || player.photo_url}
                  alt=""
                  className="pm-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="pm-avatar-placeholder">
                  <span className="pm-placeholder-icon">👤</span>
                </div>
              )}
            </div>
            {/* Jersey Badge */}
            <div className="pm-jersey-badge" title={`Số áo: ${pShirtNo}`}>
              <span className="pm-jersey-num">{pShirtNo}</span>
            </div>
          </div>

          {/* Column 1: Core Physical & Technical Info */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">Position:</span>
              <span className="pm-value pm-val-bold">
                {pPos} / {pPosCode}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Age:</span>
              <span className="pm-value pm-val-bold">{pAge}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Height:</span>
              <span className="pm-value">{pHeight}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Weight:</span>
              <span className="pm-value">{pWeight}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Preferred Foot:</span>
              <span className="pm-value">{pFoot}</span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Average Quality:</span>
              <span className="pm-value pm-val-bold pm-quality-val">{pQuality}</span>
            </div>
          </div>

          {/* Column 2: Club, Reputation, Potential, Value & Wages */}
          <div className="pm-info-col">
            <div className="pm-info-row">
              <span className="pm-label">Team:</span>
              <span className="pm-value pm-val-bold pm-team-link">
                {pClubName} {(detail?.club as any)?.country_flag ? (
                  <img src={(detail?.club as any).country_flag} alt="" className="pm-flag-img" />
                ) : null}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Country:</span>
              <span className="pm-value">
                {pCountry} {(detail?.nationality_detail?.flag_url || player.nationalityFlag) ? (
                  <img src={detail?.nationality_detail?.flag_url || player.nationalityFlag} alt="" className="pm-flag-img" />
                ) : null}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Reputation:</span>
              <span className="pm-value pm-reputation-val">
                <Award size={14} className="pm-icon-badge" />
                {formatNumber(pReputation)}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Potential:</span>
              <div className="pm-potential-wrap">
                <span className="pm-val-bold" style={{ color: 'var(--color-navy-blue)' }}>{pPotential}</span>
                <span className="pm-muted-note" style={{ fontSize: '0.75rem', marginRight: '6px' }}>/100</span>
                <div className="pm-stars-wrap">{renderStars(pPotential)}</div>
              </div>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Worth:</span>
              <span className="pm-value pm-worth-val">
                <Coins size={14} className="pm-coin-icon" /> {pWorth}
              </span>
            </div>
            <div className="pm-info-row">
              <span className="pm-label">Weekly Wages:</span>
              <span className="pm-value pm-val-bold" style={{ color: '#047857' }}>
                {pWages}
              </span>
            </div>
          </div>
        </div>

        {/* 5 Tabs Navigation Header */}
        <div className="pm-tabs-bar">
          <button
            className={`pm-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Star size={15} />
            <span>Kỹ Năng</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Activity size={15} />
            <span>Trận Đấu</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <Award size={15} />
            <span>Lịch Sử Các Mùa</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            <Coins size={15} />
            <span>Chuyển Nhượng</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'injuries' ? 'active' : ''}`}
            onClick={() => setActiveTab('injuries')}
          >
            <HeartPulse size={15} />
            <span>Lịch Sử Chấn Thương</span>
          </button>
          {isEligibleForOffer && (
            <button
              className={`pm-tab-btn ${activeTab === 'offer' ? 'active' : ''}`}
              onClick={() => setActiveTab('offer')}
              style={activeTab === 'offer' ? { color: '#16a34a', borderBottomColor: '#16a34a', fontWeight: 700 } : {}}
            >
              <Coins size={15} />
              <span>Đề Nghị Hợp Đồng (Offer)</span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="pm-tab-content">
          {loading ? (
            <div className="pm-loading-state">
              <div className="pm-spinner" />
              <span>Đang tải hồ sơ cầu thủ...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: SKILLS (100% PURE DB SCHEMA & POSITION ATTRIBUTES) */}
              {activeTab === 'skills' && (
                <div className="pm-skills-view">
                  {/* Category Filter Sub-nav */}
                  <div className="pm-skills-subnav">
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'KEY' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('KEY')}
                      title="10 Chỉ số cốt lõi theo vị trí thi đấu (Hệ số x3 OVR)"
                    >
                      ⭐ Cốt lõi vị trí (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'PHYSICAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('PHYSICAL')}
                      title="Chỉ số thể chất & sức mạnh"
                    >
                      🏃 Thể chất (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'TECHNICAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('TECHNICAL')}
                      title="Chỉ số kỹ thuật xử lý bóng"
                    >
                      ⚽ Kỹ thuật (10)
                    </button>
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'MENTAL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('MENTAL')}
                      title="Chỉ số tâm lý & nhãn quan chiến thuật"
                    >
                      🧠 Tâm lý (10)
                    </button>
                    {(pPosCode === 'GK' || (detail?.skills?.categories?.goalkeeping?.some((g: any) => g.value > 0))) && (
                      <button
                        className={`pm-subnav-btn ${skillCategory === 'GOALKEEPING' ? 'active' : ''}`}
                        onClick={() => setSkillCategory('GOALKEEPING')}
                        title="Chỉ số chuyên môn thủ môn"
                      >
                        🧤 Thủ môn (10)
                      </button>
                    )}
                    <button
                      className={`pm-subnav-btn ${skillCategory === 'ALL' ? 'active' : ''}`}
                      onClick={() => setSkillCategory('ALL')}
                      title="Toàn bộ 40 chỉ số trong CSDL"
                    >
                      📋 Tất cả (40)
                    </button>
                  </div>

                  {/* 2-Column Skills Grid */}
                  <div className="pm-skills-grid">
                    {/* Left Column Skills */}
                    <div className="pm-skills-col">
                      {displayedSkills.left.map((sk: any) => (
                        <div key={sk.id || sk.code} className="pm-skill-item" title={sk.description || `${sk.name} (${sk.code})`}>
                          <span className="pm-skill-name">
                            {sk.is_key && <span className="pm-key-star" title="Chỉ số cốt lõi vị trí">⭐ </span>}
                            <strong className="pm-skill-code">[{sk.code}]</strong> {sk.name}
                          </span>
                          <div className="pm-skill-bar-wrap">
                            <div className="pm-skill-bar-track">
                              <div
                                className="pm-skill-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(5, sk.value))}%` }}
                              >
                                <span className="pm-skill-num">{sk.value}</span>
                              </div>
                            </div>
                            {sk.potential_value && sk.potential_value > sk.value ? (
                              <span className="pm-growth-tag">(+{sk.potential_value - sk.value})</span>
                            ) : sk.growth ? (
                              <span className="pm-growth-tag">({sk.growth})</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column Skills */}
                    <div className="pm-skills-col">
                      {displayedSkills.right.map((sk: any) => (
                        <div key={sk.id || sk.code} className="pm-skill-item" title={sk.description || `${sk.name} (${sk.code})`}>
                          <span className="pm-skill-name">
                            {sk.is_key && <span className="pm-key-star" title="Chỉ số cốt lõi vị trí">⭐ </span>}
                            <strong className="pm-skill-code">[{sk.code}]</strong> {sk.name}
                          </span>
                          <div className="pm-skill-bar-wrap">
                            <div className="pm-skill-bar-track">
                              <div
                                className="pm-skill-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(5, sk.value))}%` }}
                              >
                                <span className="pm-skill-num">{sk.value}</span>
                              </div>
                            </div>
                            {sk.potential_value && sk.potential_value > sk.value ? (
                              <span className="pm-growth-tag">(+{sk.potential_value - sk.value})</span>
                            ) : sk.growth ? (
                              <span className="pm-growth-tag">({sk.growth})</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pm-skills-total-row">
                    <span className="pm-total-label">Tổng điểm {displayedSkills.label}:</span>
                    <span className="pm-total-val">{displayedSkills.total}</span>
                    <span className="pm-calc-icon">🧮</span>
                  </div>

                  {/* Skills Bottom Row: Progress Chart & Comparison Tool */}
                  <div className="pm-skills-bottom-row">
                    {/* Quality Progress Chart */}
                    <div className="pm-progress-chart-box">
                      <h4 className="pm-sub-title">Average Quality Progress</h4>
                      <div className="pm-svg-chart">
                        {/* Render simple, clean SVG line chart */}
                        {(() => {
                          const pts = detail?.skills?.quality_progress || [];
                          if (pts.length < 2) {
                            return (
                              <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                                Chưa có dữ liệu lịch sử tăng trưởng trong CSDL
                              </div>
                            );
                          }
                          const minQ = Math.min(...pts.map((p) => p.quality)) - 0.5;
                          const maxQ = Math.max(...pts.map((p) => p.quality)) + 0.5;
                          const width = 320;
                          const height = 110;
                          const padX = 25;
                          const padY = 20;

                          const getX = (idx: number) =>
                            padX + (idx / Math.max(1, pts.length - 1)) * (width - 2 * padX);
                          const getY = (q: number) =>
                            height - padY - ((q - minQ) / Math.max(0.1, maxQ - minQ)) * (height - 2 * padY);

                          const polylinePts = pts
                            .map((p, idx) => `${getX(idx)},${getY(p.quality)}`)
                            .join(' ');

                          return (
                            <svg viewBox={`0 0 ${width} ${height}`} className="pm-chart-svg">
                              {/* Grid lines */}
                              <line
                                x1={padX}
                                y1={height - padY}
                                x2={width - padX}
                                y2={height - padY}
                                stroke="#e2e8f0"
                                strokeWidth="1"
                              />
                              <line
                                x1={padX}
                                y1={padY}
                                x2={width - padX}
                                y2={padY}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                              />

                              {/* Progress curve line */}
                              <polyline
                                fill="none"
                                stroke="#15803d"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={polylinePts}
                              />

                              {/* Points & Labels */}
                              {pts.map((p, idx) => {
                                const x = getX(idx);
                                const y = getY(p.quality);
                                return (
                                  <g key={idx}>
                                    <circle cx={x} cy={y} r="4" fill="#15803d" />
                                    <text
                                      x={x}
                                      y={height - 4}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#64748b"
                                    >
                                      {p.age}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Comparison Tool */}
                    <div className="pm-compare-box">
                      <h4 className="pm-sub-title">Player Comparison Tool</h4>
                      <button
                        className={`pm-compare-btn ${compared ? 'added' : ''}`}
                        onClick={() => setCompared(!compared)}
                      >
                        <Plus size={16} />
                        <span>{compared ? 'Đã thêm (1/3)' : 'Add this Player (0/3)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MATCHES THIS SEASON */}
              {activeTab === 'matches' && (
                <div className="pm-matches-view">
                  <div className="pm-matches-header-stat">
                    <span>
                      Matches: <strong>{detail?.matches?.total ?? 0}</strong> | Missed:{' '}
                      <strong>{detail?.matches?.missed || 0} ({detail?.matches?.missed_pct || '0%'})</strong>
                    </span>
                    <HelpCircle size={14} className="pm-inline-help" />
                  </div>

                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>D</th>
                          <th>Opponent</th>
                          <th className="text-center">Result</th>
                          <th>Min</th>
                          <th>Saves/Tackles</th>
                          <th>Key/Ass</th>
                          <th>Shot/Goal</th>
                          <th className="text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.matches?.list || detail.matches.list.length === 0) ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có trận đấu nào được ghi nhận trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.matches.list.map((m, idx) => (
                          <tr key={idx}>
                            <td className="pm-dim-cell">{m.day}</td>
                            <td className="pm-bold-cell">{m.opponent}</td>
                            <td className="text-center">
                              <span
                                className={`pm-result-badge ${
                                  m.outcome === 'WIN'
                                    ? 'res-win'
                                    : m.outcome === 'LOSS'
                                    ? 'res-loss'
                                    : 'res-draw'
                                }`}
                              >
                                {m.result}
                              </span>
                            </td>
                            <td>{m.minutes}'</td>
                            <td>{m.saves_or_tackles}</td>
                            <td>{m.key_ass}</td>
                            <td>{m.shot_goal}</td>
                            <td className="text-right pm-rating-cell">{m.rating.toFixed(2)}</td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: STATISTICS ACROSS SEASONS */}
              {activeTab === 'statistics' && (
                <div className="pm-stats-view">
                  {/* Career Totals Bar */}
                  <div className="pm-career-totals-bar">
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Matches</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.matches ?? 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Caps</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.caps || 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Tackles</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.tackles ?? 0}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Key/Ass</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.key_ass || '0/0'}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Shot/Goal</span>
                      <span className="pm-stat-mini-val">
                        {detail?.statistics?.career_totals?.shot_goal || '0/0'}
                      </span>
                    </div>
                    <div className="pm-stat-mini">
                      <span className="pm-stat-mini-label">Rating</span>
                      <span className="pm-stat-mini-val">
                        {Number(detail?.statistics?.career_totals?.rating ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>S</th>
                          <th>Team</th>
                          <th>Avg. Q</th>
                          <th>Matches</th>
                          <th>Tackles</th>
                          <th>Key/Ass</th>
                          <th>Shot/Goal</th>
                          <th className="text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.statistics?.seasons || detail.statistics.seasons.length === 0) ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có thống kê mùa giải nào trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.statistics.seasons.map((s, idx) => (
                          <tr key={idx}>
                            <td className="pm-dim-cell">{s.season}</td>
                            <td className="pm-team-name-cell">{s.team}</td>
                            <td>{s.avg_quality.toFixed(2)}</td>
                            <td>{s.matches}</td>
                            <td>{s.tackles}</td>
                            <td>{s.key_ass}</td>
                            <td>{s.shot_goal}</td>
                            <td className="text-right pm-rating-cell">{s.rating.toFixed(2)}</td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TRANSFERS ACROSS SEASONS */}
              {activeTab === 'transfers' && (
                <div className="pm-transfers-view">
                  <h4 className="pm-sub-title">🕒 Transfer History</h4>
                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>From Team</th>
                          <th>To Team</th>
                          <th>Season</th>
                          <th>Avg. Q</th>
                          <th className="text-right">Bid Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.transfers?.history || detail.transfers.history.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có dữ liệu chuyển nhượng trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.transfers.history.map((t, idx) => (
                          <tr key={idx}>
                            <td className="pm-team-name-cell">{t.from_team}</td>
                            <td className="pm-team-name-cell">{t.to_team}</td>
                            <td>{t.season}</td>
                            <td>{t.avg_quality}</td>
                            <td className="text-right pm-bold-cell">
                              <Coins size={13} className="pm-coin-inline" /> {t.bid_value}
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Potential Upgrades */}
                  <div className="pm-potential-box">
                    <h4 className="pm-sub-title">📈 Potential Upgrades</h4>
                    <p className="pm-potential-desc">
                      Những cầu thủ có chỉ số OVR và tiềm năng tương tự hiện đang có mặt trên thị trường chuyển nhượng hoặc trong học viện bóng đá.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: INJURIES HISTORY */}
              {activeTab === 'injuries' && (
                <div className="pm-injuries-view">
                  {/* Current Active Injury Status */}
                  <div className="pm-injury-status-box">
                    {detail?.active_injury ? (
                      <div className="pm-status-alert pm-status-injured">
                        <AlertCircle size={20} />
                        <div>
                          <strong>Đang gặp chấn thương: {detail.active_injury.injury_type}</strong>
                          <p>
                            Mức độ: {detail.active_injury.severity} • Dự kiến nghỉ thi đấu thêm{' '}
                            {detail.active_injury.days_remaining} ngày nữa.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pm-status-alert pm-status-healthy">
                        <HeartPulse size={20} />
                        <div>
                          <strong>Thể trạng hoàn toàn khỏe mạnh</strong>
                          <p>Cầu thủ sẵn sàng 100% cho mọi trận đấu và các bài tập huấn luyện.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="pm-sub-title">📋 Hồ sơ chấn thương trong sự nghiệp</h4>
                  <div className="pm-table-wrapper">
                    <table className="pm-data-table">
                      <thead>
                        <tr>
                          <th>Loại chấn thương</th>
                          <th>Mức độ</th>
                          <th>Số ngày nghỉ</th>
                          <th>Thời gian</th>
                          <th className="text-right">Tình trạng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!detail?.injuries_tab?.history || detail.injuries_tab.history.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                              Chưa có hồ sơ chấn thương nào trong cơ sở dữ liệu
                            </td>
                          </tr>
                        ) : (detail.injuries_tab.history.map((inj) => (
                          <tr key={inj.id}>
                            <td className="pm-bold-cell">{inj.injury_name}</td>
                            <td>
                              <span
                                className={`pm-sev-tag ${
                                  inj.severity === 'SEVERE'
                                    ? 'sev-high'
                                    : inj.severity === 'MODERATE'
                                    ? 'sev-mid'
                                    : 'sev-low'
                                }`}
                              >
                                {inj.severity === 'SEVERE'
                                  ? 'Nặng'
                                  : inj.severity === 'MODERATE'
                                  ? 'Trung bình'
                                  : 'Nhẹ'}
                              </span>
                            </td>
                            <td>{inj.days_missed} ngày</td>
                            <td>{inj.season}</td>
                            <td className="text-right">
                              <span
                                className={`pm-status-tag ${
                                  inj.status === 'ACTIVE' ? 'tag-active' : 'tag-recovered'
                                }`}
                              >
                                {inj.status === 'ACTIVE' ? 'Đang điều trị' : 'Đã bình phục'}
                              </span>
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: OFFER (ĐỀ NGHỊ CHUYỂN NHƯỢNG & HỢP ĐỒNG) */}
              {isEligibleForOffer && activeTab === 'offer' && (
                <div style={{ padding: '0.5rem 0.25rem' }}>
                  {/* Alert thông báo kết quả */}
                  {offerSuccess && (
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        marginBottom: '1.25rem',
                        borderRadius: '10px',
                        background: '#f0fdf4',
                        border: '1.5px solid #22c55e',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      <Award size={20} color="#16a34a" />
                      <span>{offerSuccess}</span>
                    </div>
                  )}

                  {offerError && (
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        marginBottom: '1.25rem',
                        borderRadius: '10px',
                        background: '#fef2f2',
                        border: '1.5px solid #ef4444',
                        color: '#b91c1c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      <AlertCircle size={20} color="#dc2626" />
                      <span>{offerError}</span>
                    </div>
                  )}

                  {/* Banner tải đề nghị trước đó */}
                  {loadingOffer && (
                    <div style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="spinner" style={{ width: 14, height: 14 }} />
                      <span>Đang kiểm tra lời đề nghị trước đó của bạn cho cầu thủ này...</span>
                    </div>
                  )}

                  {existingOffer && (
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        marginBottom: '1.25rem',
                        borderRadius: '10px',
                        border: existingOffer.status === 'PENDING' ? '1.5px solid #f59e0b' : existingOffer.status === 'ACCEPTED' ? '1.5px solid #16a34a' : existingOffer.status === 'REJECTED' ? '1.5px solid #dc2626' : '1.5px solid #94a3b8',
                        background: existingOffer.status === 'PENDING' ? '#fffbeb' : existingOffer.status === 'ACCEPTED' ? '#f0fdf4' : existingOffer.status === 'REJECTED' ? '#fef2f2' : '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.15rem' }}>
                            {existingOffer.status === 'PENDING' ? '⏳' : existingOffer.status === 'ACCEPTED' ? '✅' : existingOffer.status === 'REJECTED' ? '❌' : 'ℹ️'}
                          </span>
                          <strong style={{ fontSize: '0.95rem', color: existingOffer.status === 'PENDING' ? '#b45309' : existingOffer.status === 'ACCEPTED' ? '#15803d' : existingOffer.status === 'REJECTED' ? '#b91c1c' : '#475569' }}>
                            {existingOffer.status === 'PENDING' ? 'Bạn đang có một lời đề nghị chờ phản hồi' : existingOffer.status === 'ACCEPTED' ? 'Lời đề nghị của bạn đã được chấp thuận!' : existingOffer.status === 'REJECTED' ? 'Lời đề nghị trước đó đã bị từ chối' : 'Lời đề nghị trước đó đã bị hủy'}
                          </strong>
                        </div>
                        <span
                          className={`badge ${
                            existingOffer.status === 'PENDING'
                              ? 'badge-warning'
                              : existingOffer.status === 'ACCEPTED'
                              ? 'badge-success'
                              : existingOffer.status === 'REJECTED'
                              ? 'badge-danger'
                              : 'badge-outline'
                          }`}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', fontWeight: 800 }}
                        >
                          {existingOffer.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.86rem', color: '#1e293b', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.85)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div>Hình thức: <strong>{existingOffer.is_loan ? 'Cho Mượn' : 'Mua Đứt'}</strong></div>
                        <div>Phí đề nghị: <strong style={{ color: '#15803d' }}>{existingOffer.is_loan ? '€0 (Mượn)' : `€${Number(existingOffer.offer_amount || 0).toLocaleString()}`}</strong></div>
                        <div>Lương cam kết: <strong style={{ color: '#d97706' }}>€{Number(existingOffer.proposed_wage || 0).toLocaleString()} / tuần</strong></div>
                        <div>Thời hạn: <strong>{existingOffer.contract_years || 3} năm</strong></div>
                      </div>

                      {existingOffer.status === 'PENDING' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          <button
                            type="button"
                            disabled={cancellingOffer}
                            onClick={handleOpenCancelConfirm}
                            className="btn btn-xs btn-danger flex-center"
                            style={{ gap: '0.35rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
                          >
                            {cancellingOffer ? 'Đang hủy...' : '✕ HỦY ĐỀ NGHỊ NÀY'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {/* PHẦN 1: ĐỀ NGHỊ CHO CLB */}
                    <div
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          🏢 Phần 1: Đề Nghị Cho CLB Chủ Quản
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Thỏa thuận hình thức chuyển giao và mức phí chuyển nhượng
                        </div>
                      </div>

                      {/* Loại chuyển nhượng: Mua đứt / Mượn */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                          Hình thức chuyển nhượng:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setIsLoan(false)}
                            style={{
                              padding: '0.65rem 1rem',
                              borderRadius: '8px',
                              border: !isLoan ? '2px solid #16a34a' : '1px solid #cbd5e1',
                              background: !isLoan ? '#f0fdf4' : '#ffffff',
                              color: !isLoan ? '#15803d' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              transition: 'all 0.2s',
                            }}
                          >
                            🔵 Mua Đứt (Permanent)
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsLoan(true)}
                            style={{
                              padding: '0.65rem 1rem',
                              borderRadius: '8px',
                              border: isLoan ? '2px solid #eab308' : '1px solid #cbd5e1',
                              background: isLoan ? '#fefce8' : '#ffffff',
                              color: isLoan ? '#854d0e' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              transition: 'all 0.2s',
                            }}
                          >
                            🟡 Mượn Cầu Thủ (Loan)
                          </button>
                        </div>
                      </div>

                      {/* Nếu là MUA ĐỨT: Hiển thị ô nhập giá chuyển nhượng */}
                      {!isLoan ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                              Phí chuyển nhượng đề nghị (€):
                            </label>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Định giá: <strong>€{Number((player as any).asking_price || player.market_value || 2500000).toLocaleString()}</strong>
                            </span>
                          </div>

                          <div style={{ position: 'relative' }}>
                            <input
                              type="number"
                              min={0}
                              step={100000}
                              value={offerAmount || ''}
                              onChange={(e) => setOfferAmount(Math.max(0, Number(e.target.value)))}
                              className="input-text"
                              style={{
                                width: '100%',
                                padding: '0.65rem 1rem',
                                fontSize: '1.05rem',
                                fontWeight: 800,
                                color: '#15803d',
                              }}
                            />
                            <span style={{ position: 'absolute', right: 12, top: 10, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
                              €{(offerAmount / 1000000).toFixed(2)}M
                            </span>
                          </div>

                          {/* Quick Adjust Buttons */}
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(Number((player as any).asking_price || player.market_value || 2500000))}
                            >
                              Theo giá thị trường
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(Math.max(0, offerAmount - 500000))}
                            >
                              -€500K
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 500000)}
                            >
                              +€500K
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 1000000)}
                            >
                              +€1.0M
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => setOfferAmount(offerAmount + 5000000)}
                            >
                              +€5.0M
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Nếu là MƯỢN: KHÔNG CÓ Ô NHẬP GIÁ */
                        <div
                          style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: '#fefce8',
                            border: '1px dashed #ca8a04',
                            color: '#713f12',
                            fontSize: '0.84rem',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong>ℹ️ Mượn cầu thủ không mất phí chuyển nhượng:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#854d0e' }}>
                            CLB chủ quản đồng ý cho mượn mà không thu phí chuyển nhượng. Bạn chỉ cần thỏa thuận thời hạn mượn và chi trả lương cầu thủ ở Phần 2.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* PHẦN 2: THỎA THUẬN HỢP ĐỒNG CẦU THỦ */}
                    <div
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          ✍️ Phần 2: Thỏa Thuận Hợp Đồng Cầu Thủ
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Điều khoản đãi ngộ và cam kết thời gian gắn bó với CLB
                        </div>
                      </div>

                      {/* Thời gian hợp đồng */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                          Thời gian hợp đồng:
                        </label>
                        {!isLoan ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
                            {[1, 2, 3, 4, 5].map((yr) => (
                              <button
                                key={yr}
                                type="button"
                                onClick={() => setContractYears(yr)}
                                style={{
                                  padding: '0.55rem 0.2rem',
                                  borderRadius: '6px',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: contractYears === yr ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                  background: contractYears === yr ? '#dcfce7' : '#ffffff',
                                  color: contractYears === yr ? '#15803d' : '#475569',
                                  transition: 'all 0.15s',
                                  textAlign: 'center',
                                }}
                              >
                                {yr} Năm
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => setContractYears(1)}
                              style={{
                                padding: '0.55rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: contractYears === 1 ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                                background: contractYears === 1 ? '#fef9c3' : '#ffffff',
                                color: contractYears === 1 ? '#854d0e' : '#475569',
                                transition: 'all 0.15s',
                                textAlign: 'center',
                              }}
                            >
                              Nửa Mùa (20 ngày)
                            </button>
                            <button
                              type="button"
                              onClick={() => setContractYears(2)}
                              style={{
                                padding: '0.55rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: contractYears === 2 ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                                background: contractYears === 2 ? '#fef9c3' : '#ffffff',
                                color: contractYears === 2 ? '#854d0e' : '#475569',
                                transition: 'all 0.15s',
                                textAlign: 'center',
                              }}
                            >
                              Cả Mùa Giải (40 ngày)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lương cầu thủ */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                            Mức lương đề nghị (€/tuần):
                          </label>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Lương đề xuất: <strong>€{Math.round(Number((player as any).asking_price || player.market_value || 2500000) * 0.005).toLocaleString()}</strong>
                          </span>
                        </div>

                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={proposedWage || ''}
                            onChange={(e) => setProposedWage(Math.max(0, Number(e.target.value)))}
                            className="input-text"
                            style={{
                              width: '100%',
                              padding: '0.65rem 1rem',
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: '#d97706',
                            }}
                          />
                          <span style={{ position: 'absolute', right: 12, top: 10, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
                            / tuần
                          </span>
                        </div>

                        {/* Nút chỉnh lương nhanh */}
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(Math.round(Number((player as any).asking_price || player.market_value || 2500000) * 0.005))}
                          >
                            Lương chuẩn
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(Math.max(500, proposedWage - 1000))}
                          >
                            -€1,000
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(proposedWage + 1000)}
                          >
                            +€1,000
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => setProposedWage(proposedWage + 5000)}
                          >
                            +€5,000
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TỔNG KẾT & XÁC NHẬN GỬI ĐI */}
                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '1.25rem 1.5rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Tóm tắt chi phí giao dịch:</div>
                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '4px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Phí chuyển nhượng: </span>
                          <strong style={{ fontSize: '0.95rem', color: isLoan ? '#854d0e' : '#15803d' }}>
                            {isLoan ? '€0 (Mượn)' : `€${offerAmount.toLocaleString()}`}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Lương cam kết: </span>
                          <strong style={{ fontSize: '0.95rem', color: '#d97706' }}>
                            €{proposedWage.toLocaleString()} / tuần
                          </strong>
                        </div>
                        {cashBalance !== undefined && (
                          <div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ngân sách CLB: </span>
                            <strong style={{ fontSize: '0.95rem', color: cashBalance >= (isLoan ? 0 : offerAmount) ? '#16a34a' : '#dc2626' }}>
                              €{cashBalance.toLocaleString()}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cảnh báo không đủ ngân sách */}
                    {!isLoan && cashBalance !== undefined && offerAmount > cashBalance && (
                      <div
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          marginBottom: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#b91c1c',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                        }}
                      >
                        <AlertCircle size={16} color="#dc2626" />
                        <span>
                          Ngân sách CLB (€{cashBalance.toLocaleString()}) không đủ để trả phí chuyển nhượng (€{offerAmount.toLocaleString()})! Vui lòng giảm mức giá đề nghị hoặc chọn hình thức mượn.
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={offerSubmitting}
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
                      {offerSubmitting ? (
                        <>
                          <div className="spinner" style={{ width: 16, height: 16 }} />
                          <span>Đang gửi đề nghị...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Xác Nhận Gửi Lời Đề Nghị</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pm-footer">
          <span className="pm-player-id">#{player.id}</span>
          <button className="pm-footer-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
        {/* MODAL XÁC NHẬN HỦY LỜI ĐỀ NGHỊ */}
        <ConfirmModal
          isOpen={confirmCancelModal}
          title="Xác Nhận Hủy Lời Đề Nghị"
          variant="danger"
          confirmText="Đồng Ý Hủy"
          cancelText="Quay Lại"
          isLoading={cancellingOffer}
          onConfirm={executeCancelOffer}
          onClose={() => !cancellingOffer && setConfirmCancelModal(false)}
          message={
            <div>
              <p style={{ margin: '0 0 1rem 0', color: '#475569' }}>
                Bạn có chắc chắn muốn rút lại lời đề nghị chuyển nhượng đang chờ phản hồi cho cầu thủ này không?
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
                <div>Cầu thủ: <strong style={{ color: '#0f172a' }}>{player.name || player.common_name || (player.first_name ? player.first_name + ' ' + (player.last_name || '') : 'Cầu thủ')}</strong></div>
                <div>Hình thức: <strong>{existingOffer && existingOffer.is_loan ? 'Cho Mượn' : 'Mua Đứt'}</strong></div>
                <div>Mức phí hoàn trả: <strong style={{ color: '#dc2626' }}>{existingOffer && existingOffer.is_loan ? '€0 (Mượn)' : '€' + Number(existingOffer ? existingOffer.offer_amount : 0).toLocaleString()}</strong></div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};
