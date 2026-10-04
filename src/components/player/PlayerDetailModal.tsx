import { ConfirmModal } from '../common/ConfirmModal';
import { PlayerSkillsTab } from './PlayerSkillsTab';
import { PlayerMatchesTab } from './PlayerMatchesTab';
import { PlayerStatsTab } from './PlayerStatsTab';
import { PlayerTransfersTab } from './PlayerTransfersTab';
import { PlayerInjuriesTab } from './PlayerInjuriesTab';
import { PlayerOfferTab } from './PlayerOfferTab';
import React, { useState, useEffect } from 'react';
import { Player, PlayerDetailData } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { playersApi } from '../../services/players.service';
import { transfersApi } from '../../services/transfers.service';
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

export interface Props {
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

  // Kiß╗âm tra cß║ºu thß╗º c├│ thuß╗Öc CLB cß╗ºa ng╞░ß╗¥i d├╣ng kh├┤ng
  const isOwnClub = Boolean(
    currentClubId && (
      String(player.club_id) === String(currentClubId) ||
      String((player as any).currentClub?.id) === String(currentClubId) ||
      String((player as any).club?.id) === String(currentClubId) ||
      (detail?.club?.id ? String(detail.club.id) === String(currentClubId) : false)
    )
  );

  // Kiß╗âm tra cß║ºu thß╗º c├│ ─æang trong diß╗çn chuyß╗ân nh╞░ß╗úng (b├ín / m╞░ß╗ún / tß╗▒ do) kh├┤ng
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

  // Chß╗ë hiß╗ân thß╗ï tab Offer khi: Cß║ºu thß╗º KH├öNG thuß╗Öc CLB cß╗ºa m├¼nh V├Ç ─æang trong diß╗çn chuyß╗ân nh╞░ß╗úng
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
      setOfferSuccess('─É├ú hß╗ºy lß╗¥i ─æß╗ü nghß╗ï chuyß╗ân nh╞░ß╗úng th├ánh c├┤ng!');
      setExistingOffer({ ...existingOffer, status: 'CANCELLED' });
      setConfirmCancelModal(false);
      if (onOfferSuccess) {
        onOfferSuccess();
      }
    } catch (err: any) {
      setOfferError(err.response?.data?.message || err.message || 'Kh├┤ng thß╗â hß╗ºy ─æß╗ü nghß╗ï.');
    } finally {
      setCancellingOffer(false);
    }
  };

  const handleSendOffer = async () => {
    setOfferError('');
    setOfferSuccess('');

    if (!currentClubId) {
      setOfferError('Bß║ín cß║ºn quß║ún l├╜ mß╗Öt CLB ─æß╗â gß╗¡i ─æß╗ü nghß╗ï chuyß╗ân nh╞░ß╗úng!');
      return;
    }
    if (!isLoan && cashBalance !== undefined && offerAmount > cashBalance) {
      setOfferError(`Ng├ón s├ích CLB kh├┤ng ─æß╗º! Bß║ín hiß╗çn c├│ Γé¼${cashBalance.toLocaleString()}, trong khi ph├¡ chuyß╗ân nh╞░ß╗úng ─æß╗ü xuß║Ñt l├á Γé¼${offerAmount.toLocaleString()}. Vui l├▓ng giß║úm mß╗⌐c gi├í hoß║╖c chß╗ìn m╞░ß╗ún cß║ºu thß╗º.`);
      return;
    }
    const targetPlayerId = (player as any).playerId || player.id;
    const targetClubId = (player as any).currentClub?.id || player.club_id || (player as any).club?.id;
    if (!targetClubId) {
      setOfferError('Kh├┤ng x├íc ─æß╗ïnh ─æ╞░ß╗úc CLB chß╗º quß║ún cß╗ºa cß║ºu thß╗º.');
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
          ? '─É├ú gß╗¡i lß╗¥i ─æß╗ü nghß╗ï m╞░ß╗ún cß║ºu thß╗º th├ánh c├┤ng tß╗¢i CLB chß╗º quß║ún!'
          : '─É├ú gß╗¡i lß╗¥i ─æß╗ü nghß╗ï mua ─æß╗⌐t cß║ºu thß╗º th├ánh c├┤ng tß╗¢i CLB chß╗º quß║ún!'
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
      setOfferError(err.response?.data?.message || err.message || 'Kh├┤ng thß╗â gß╗¡i ─æß╗ü nghß╗ï chuyß╗ân nh╞░ß╗úng.');
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
      return { left: [], right: [], total: 0, label: 'Chß╗ë sß╗æ cß╗æt l├╡i' };
    }

    let list: any[] = [];
    let label = 'Chß╗ë sß╗æ cß╗æt l├╡i vß╗ï tr├¡ (10)';

    if (skillCategory === 'KEY') {
      list = (detail.skills.key_attributes && detail.skills.key_attributes.length > 0)
        ? detail.skills.key_attributes
        : [...(detail.skills.left_column || []), ...(detail.skills.right_column || [])];
      label = `Chß╗ë sß╗æ cß╗æt l├╡i vß╗ï tr├¡ (${list.length})`;
    } else if (skillCategory === 'PHYSICAL') {
      list = detail.skills.categories?.physical || [];
      label = `Thß╗â chß║Ñt - Physical (${list.length})`;
    } else if (skillCategory === 'TECHNICAL') {
      list = detail.skills.categories?.technical || [];
      label = `Kß╗╣ thuß║¡t - Technical (${list.length})`;
    } else if (skillCategory === 'MENTAL') {
      list = detail.skills.categories?.mental || [];
      label = `T├óm l├╜ & Nhß║¡n thß╗⌐c - Mental (${list.length})`;
    } else if (skillCategory === 'GOALKEEPING') {
      list = detail.skills.categories?.goalkeeping || [];
      label = `Kß╗╣ n─âng Thß╗º m├┤n - Goalkeeping (${list.length})`;
    } else {
      list = detail.skills.all_attributes || [];
      label = `Tß║Ñt cß║ú chß╗ë sß╗æ (${list.length})`;
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
  const pPos = detail?.primary_position?.name || detail?.position?.name || player.position?.name || 'Cß║ºu thß╗º';
  const pPosCode = detail?.primary_position?.code || detail?.position?.code || player.position?.code || '-';
  
  // Chiß╗üu cao & C├ón nß║╖ng chuß║⌐n h├│a tß╗½ DB
  const rawHeight = detail?.height || (player as any).height;
  const pHeight = rawHeight && rawHeight !== '-' 
    ? `${Math.round(parseFloat(String(rawHeight).replace(/[^\d.]/g, '')))} cm` 
    : '-';

  const rawWeight = detail?.weight || (player as any).weight;
  const pWeight = rawWeight && rawWeight !== '-' 
    ? `${Math.round(parseFloat(String(rawWeight).replace(/[^\d.]/g, '')))} kg` 
    : '-';

  // Ch├ón thuß║¡n
  const rawFoot = (detail?.preferred_foot || (player as any).preferred_foot || 'RIGHT').toUpperCase();
  const pFoot = rawFoot === 'LEFT' ? 'Left (Tr├íi)' : rawFoot === 'BOTH' ? 'Both (Hai ch├ón)' : 'Right (Phß║úi)';

  // Danh tiß║┐ng & Tiß╗üm n─âng
  const pReputation = detail?.reputation ?? player.reputation ?? 0;
  const pPotential = detail?.potential ?? player.potential ?? 0;

  // ─Éiß╗âm OVR / Average Quality
  const pQuality = (detail?.average_quality ?? player.overall_rating ?? 50.0).toFixed(2);
  const pClubName = detail?.club?.name || player.club?.name || 'Tß╗▒ do';
  const pCountry = typeof detail?.nationality === 'object'
    ? (detail?.nationality as any)?.name
    : typeof player.nationality === 'object'
    ? (player.nationality as any)?.name
    : (detail?.nationality || player.nationality || '-');
  const pShirtNo = detail?.squad_number ?? player.squad_number ?? 1;

  // Gi├í trß╗ï thß╗ï tr╞░ß╗¥ng v├á L╞░╞íng tuß║ºn d├╣ng chung h├ám formatCurrency duy nhß║Ñt
  const pMarketValue = detail?.market_value ?? player.market_value;
  const pWorth = formatCurrency(pMarketValue);

  const pWeeklyWage = (detail as any)?.weekly_wage ?? (player.contract?.salary ? Math.round(Number(player.contract.salary) / 52) : null);
  const pWages = pWeeklyWage && pWeeklyWage > 0 
    ? `${formatCurrency(pWeeklyWage)} / tuß║ºn` 
    : (detail?.weekly_wages_display || 'Ch╞░a k├╜ H─É');

  // Hiß╗ân thß╗ï sao tiß╗üm n─âng theo thang chuß║⌐n 1-100 (mß╗ùi 20 ─æiß╗âm = 1 sao)
  const renderStars = (pot: number) => {
    const starCount = pot > 5 ? Math.min(5, Math.max(1, Math.round(pot / 20))) : Math.max(1, pot);
    const list = [];
    for (let i = 1; i <= 5; i++) {
      list.push(
        <span key={i} className={i <= starCount ? 'star-gold' : 'star-muted'}>
          Γÿà
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
              title="Cß║ºu thß╗º tr╞░ß╗¢c"
              disabled={!hasPrev}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="pm-nav-btn"
              onClick={handleNext}
              title="Cß║ºu thß╗º tiß║┐p theo"
              disabled={!hasNext}
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="pm-player-title">{pName}</h2>
            <button className="pm-icon-btn" title="Chß╗ënh sß╗¡a t├¬n / biß╗çt danh">
              <Edit2 size={16} />
            </button>
            <button
              className={`pm-icon-btn ${isFavorite ? 'fav-active' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
              title="─É├ính dß║Ñu y├¬u th├¡ch"
            >
              <Star size={17} fill={isFavorite ? '#eab308' : 'none'} color={isFavorite ? '#eab308' : '#64748b'} />
            </button>
          </div>

          <button className="pm-close-btn" onClick={onClose} title="─É├│ng">
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
                  <span className="pm-placeholder-icon">≡ƒæñ</span>
                </div>
              )}
            </div>
            {/* Jersey Badge */}
            <div className="pm-jersey-badge" title={`Sß╗æ ├ío: ${pShirtNo}`}>
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
            <span>Kß╗╣ N─âng</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Activity size={15} />
            <span>Trß║¡n ─Éß║Ñu</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <Award size={15} />
            <span>Lß╗ïch Sß╗¡ C├íc M├╣a</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            <Coins size={15} />
            <span>Chuyß╗ân Nh╞░ß╗úng</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'injuries' ? 'active' : ''}`}
            onClick={() => setActiveTab('injuries')}
          >
            <HeartPulse size={15} />
            <span>Lß╗ïch Sß╗¡ Chß║Ñn Th╞░╞íng</span>
          </button>
          {isEligibleForOffer && (
            <button
              className={`pm-tab-btn ${activeTab === 'offer' ? 'active' : ''}`}
              onClick={() => setActiveTab('offer')}
              style={activeTab === 'offer' ? { color: '#16a34a', borderBottomColor: '#16a34a', fontWeight: 700 } : {}}
            >
              <Coins size={15} />
              <span>─Éß╗ü Nghß╗ï Hß╗úp ─Éß╗ông (Offer)</span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="pm-tab-content">
          {loading ? (
            <div className="pm-loading-state">
              <div className="pm-spinner" />
              <span>─Éang tß║úi hß╗ô s╞í cß║ºu thß╗º...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: SKILLS (100% PURE DB SCHEMA & POSITION ATTRIBUTES) */}
              {/* TAB 1: SKILLS */}
              {activeTab === 'skills' && (
                <PlayerSkillsTab
                  detail={detail}
                  pPosCode={pPosCode}
                  skillCategory={skillCategory}
                  setSkillCategory={setSkillCategory}
                  compared={compared}
                  setCompared={setCompared}
                  displayedSkills={displayedSkills}
                />
              )}

              {/* TAB 2: MATCHES THIS SEASON */}
              {activeTab === 'matches' && (
                <PlayerMatchesTab detail={detail} />
              )}

              {/* TAB 3: STATISTICS ACROSS SEASONS */}
              {activeTab === 'statistics' && (
                <PlayerStatsTab detail={detail} />
              )}

              {/* TAB 4: TRANSFERS */}
              {activeTab === 'transfers' && (
                <PlayerTransfersTab detail={detail} />
              )}

              {/* TAB 5: INJURIES */}
              {activeTab === 'injuries' && (
                <PlayerInjuriesTab detail={detail} />
              )}

              {/* TAB 6: OFFER */}
              {isEligibleForOffer && activeTab === 'offer' && (
                <PlayerOfferTab
                  player={player}
                  detail={detail}
                  currentClubId={currentClubId}
                  cashBalance={cashBalance}
                  offerSuccess={offerSuccess}
                  offerError={offerError}
                  loadingOffer={loadingOffer}
                  existingOffer={existingOffer}
                  isLoan={isLoan}
                  setIsLoan={setIsLoan}
                  offerAmount={offerAmount}
                  setOfferAmount={setOfferAmount}
                  proposedWage={proposedWage}
                  setProposedWage={setProposedWage}
                  contractYears={contractYears}
                  setContractYears={setContractYears}
                  offerSubmitting={offerSubmitting}
                  handleSendOffer={handleSendOffer}
                  handleOpenCancelConfirm={() => setConfirmCancelModal(true)}
                  cancellingOffer={cancellingOffer}
                />
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
        {/* MODAL X├üC NHß║¼N Hß╗ªY Lß╗£I ─Éß╗Ç NGHß╗è */}
        <ConfirmModal
          isOpen={confirmCancelModal}
          title="X├íc Nhß║¡n Hß╗ºy Lß╗¥i ─Éß╗ü Nghß╗ï"
          variant="danger"
          confirmText="─Éß╗ông ├¥ Hß╗ºy"
          cancelText="Quay Lß║íi"
          isLoading={cancellingOffer}
          onConfirm={executeCancelOffer}
          onClose={() => !cancellingOffer && setConfirmCancelModal(false)}
          message={
            <div>
              <p style={{ margin: '0 0 1rem 0', color: '#475569' }}>
                Bß║ín c├│ chß║»c chß║»n muß╗æn r├║t lß║íi lß╗¥i ─æß╗ü nghß╗ï chuyß╗ân nh╞░ß╗úng ─æang chß╗¥ phß║ún hß╗ôi cho cß║ºu thß╗º n├áy kh├┤ng?
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
                <div>Cß║ºu thß╗º: <strong style={{ color: '#0f172a' }}>{player.name || player.common_name || (player.first_name ? player.first_name + ' ' + (player.last_name || '') : 'Cß║ºu thß╗º')}</strong></div>
                <div>H├¼nh thß╗⌐c: <strong>{existingOffer && existingOffer.is_loan ? 'Cho M╞░ß╗ún' : 'Mua ─Éß╗⌐t'}</strong></div>
                <div>Mß╗⌐c ph├¡ ho├án trß║ú: <strong style={{ color: '#dc2626' }}>{existingOffer && existingOffer.is_loan ? 'Γé¼0 (M╞░ß╗ún)' : 'Γé¼' + Number(existingOffer ? existingOffer.offer_amount : 0).toLocaleString()}</strong></div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};
